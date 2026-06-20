package com.handyserve.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * Runs once on application startup to perform schema migrations that
 * Hibernate ddl-auto: update cannot handle automatically.
 *
 * Operations (all idempotent — safe to run on every restart):
 *
 *  1. Drop the FK constraint on HS_VERIFICATION_TOKENS.USER_ID → HS_USERS
 *     so the column can now store pendingId / password-reset sentinel values.
 *
 *  2. Delete old unverified users from HS_USERS that were created by the
 *     pre-fix registration flow (verified = 0). These users never completed
 *     OTP verification and should NOT exist in the production table.
 *     Any dependent rows (verification tokens) are deleted first.
 */
@Component
@Order(1) // Run before DatabaseSeeder
public class SchemaMigrationRunner implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(SchemaMigrationRunner.class);

    private final JdbcTemplate jdbc;

    public SchemaMigrationRunner(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @Override
    public void run(ApplicationArguments args) {
        dropVerifTokenUserFkIfExists();
        purgeOldUnverifiedUsers();
        purgeOrphanedVerificationTokens();
    }

    // ── Step 1: Drop FK Constraint ─────────────────────────────────────────

    /**
     * Drops any referential constraint on HS_VERIFICATION_TOKENS that points
     * back to HS_USERS. Once dropped, the USER_ID column is a plain Long.
     */
    private void dropVerifTokenUserFkIfExists() {
        try {
            String findFk =
                "SELECT CONSTRAINT_NAME FROM ALL_CONSTRAINTS " +
                "WHERE TABLE_NAME = 'HS_VERIFICATION_TOKENS' " +
                "  AND CONSTRAINT_TYPE = 'R' " +
                "  AND OWNER = 'HANDYSERVE' " +
                "  AND ROWNUM = 1";

            String constraintName = null;
            try {
                constraintName = jdbc.queryForObject(findFk, String.class);
            } catch (org.springframework.dao.EmptyResultDataAccessException ignored) { }

            if (constraintName != null) {
                jdbc.execute(
                    "ALTER TABLE HANDYSERVE.HS_VERIFICATION_TOKENS DROP CONSTRAINT " + constraintName
                );
                log.info("[Migration] Dropped FK '{}' from HS_VERIFICATION_TOKENS. " +
                         "USER_ID column is now a free Long field.", constraintName);
            } else {
                log.debug("[Migration] No FK found on HS_VERIFICATION_TOKENS — skipped.");
            }
        } catch (Exception e) {
            log.warn("[Migration] Could not drop FK on HS_VERIFICATION_TOKENS: {}", e.getMessage());
        }
    }

    // ── Step 2: Purge Old Unverified Users ────────────────────────────────

    /**
     * Removes users that were created by the OLD registration flow (before the
     * verify-first fix) but never completed email verification.
     *
     * These rows are identified by:  VERIFIED = 0  AND  ROLE != 'admin'
     *
     * The admin account is explicitly excluded — it is always seeded verified.
     * Any HS_VERIFICATION_TOKENS rows pointing to these users are deleted first
     * (FK cascade might not exist, so we handle it manually).
     */
    private void purgeOldUnverifiedUsers() {
        try {
            // Count how many unverified non-admin users exist
            Integer count = jdbc.queryForObject(
                "SELECT COUNT(*) FROM HANDYSERVE.HS_USERS " +
                "WHERE VERIFIED = 0 AND ROLE != 'admin'",
                Integer.class
            );

            if (count == null || count == 0) {
                log.debug("[Migration] No old unverified users found — skipped.");
                return;
            }

            // Delete HS_BOOKINGS rows referencing unverified users as customer or provider
            // (these bookings were impossible in production but may exist from old test data)
            jdbc.update(
                "DELETE FROM HANDYSERVE.HS_BOOKINGS " +
                "WHERE CUSTOMER_ID IN (SELECT ID FROM HANDYSERVE.HS_USERS WHERE VERIFIED = 0 AND ROLE != 'admin') " +
                "   OR PROVIDER_ID IN (SELECT ID FROM HANDYSERVE.HS_USERS WHERE VERIFIED = 0 AND ROLE != 'admin')"
            );

            // Delete HS_VERIFICATION_TOKENS rows linked to these unverified users
            // (USER_ID = positive user ID, meaning they were old-style registration tokens)
            jdbc.update(
                "DELETE FROM HANDYSERVE.HS_VERIFICATION_TOKENS " +
                "WHERE USER_ID IN (SELECT ID FROM HANDYSERVE.HS_USERS WHERE VERIFIED = 0 AND ROLE != 'admin')"
            );

            // Finally, delete the unverified users themselves
            int deleted = jdbc.update(
                "DELETE FROM HANDYSERVE.HS_USERS WHERE VERIFIED = 0 AND ROLE != 'admin'"
            );

            log.info("[Migration] Purged {} old unverified user(s) from HS_USERS. " +
                     "These users never completed OTP verification.", deleted);

        } catch (Exception e) {
            log.warn("[Migration] Could not purge unverified users: {}", e.getMessage());
        }
    }

    // ── Step 3: Purge Orphaned Verification Tokens ────────────────────────

    /**
     * After purging unverified users, clean up any leftover HS_VERIFICATION_TOKENS
     * rows whose USER_ID no longer points to a valid HS_USERS row.
     * (These were old-style registration tokens from the pre-fix flow.)
     */
    private void purgeOrphanedVerificationTokens() {
        try {
            int deleted = jdbc.update(
                "DELETE FROM HANDYSERVE.HS_VERIFICATION_TOKENS " +
                "WHERE USER_ID > 0 " +
                "  AND USER_ID NOT IN (SELECT ID FROM HANDYSERVE.HS_USERS)"
            );
            if (deleted > 0) {
                log.info("[Migration] Purged {} orphaned HS_VERIFICATION_TOKENS row(s).", deleted);
            }
        } catch (Exception e) {
            log.warn("[Migration] Could not purge orphaned tokens: {}", e.getMessage());
        }
    }
}

package com.handyserve.apikey;

import com.handyserve.entity.ApiKey;
import com.handyserve.repository.oracle.ApiKeyRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Seeds all 40 API keys into HS_API_KEYS at application startup.
 * Each key is unique per feature/component/button.
 * Keys are idempotent — re-running will NOT duplicate them.
 *
 * These are the EXACT values to use in Postman → X-Api-Key header.
 */
@Slf4j
@Component
@Order(2)          // runs after DatabaseSeeder
@RequiredArgsConstructor
public class ApiKeySeeder implements CommandLineRunner {

    private final ApiKeyRepository apiKeyRepository;

    @Override
    public void run(String... args) {

        List<ApiKeyDef> definitions = List.of(

            // ── AUTH ─────────────────────────────────────────────────────
            new ApiKeyDef("HSP-AUTH-STATS",    "hsp-auth-stats-aK9mX2bNqR",   "Landing Page Public Stats",         "StatsSection",             "/",                     "GET",   "/api/auth/public-stats",          "public",            60),
            new ApiKeyDef("HSP-AUTH-REGISTER", "hsp-auth-reg-bQ8wY3cOpS",     "User Registration Form Submit",     "RegisterPage Form",        "/register",             "POST",  "/api/auth/register",              "public",            20),
            new ApiKeyDef("HSP-AUTH-LOGIN",    "hsp-auth-lgn-cR7vZ4dPtT",     "User Login Button",                 "LoginPage Submit",         "/login",                "POST",  "/api/auth/login",                 "public",            15),
            new ApiKeyDef("HSP-AUTH-LOGOUT",   "hsp-auth-lgt-dS6uA5eQuU",     "Logout Button",                     "ProfileDrawer Logout Btn", "Any Dashboard",         "POST",  "/api/auth/logout",                "all",               30),
            new ApiKeyDef("HSP-AUTH-ME",       "hsp-auth-me0-eT5tB6fRvV",     "Get Current User (App Mount)",      "AppLayout Mount",          "All Dashboards",        "GET",   "/api/auth/me",                    "all",               120),
            new ApiKeyDef("HSP-AUTH-ROLE",     "hsp-auth-rol-fU4sC7gSwW",     "Select Role Button",                "RoleSelectionPage Button", "/select-role",          "POST",  "/api/auth/select-role",           "all",               10),
            new ApiKeyDef("HSP-AUTH-PROFILE",  "hsp-auth-prf-gV3rD8hTxX",     "Update Profile Form Submit",        "ProfilePage Form",         "/*/profile",            "PATCH", "/api/auth/profile",               "all",               30),
            new ApiKeyDef("HSP-AUTH-REFRESH",  "hsp-auth-rfr-hW2qE9iUyY",     "Silent Token Refresh",              "AuthContext Auto Refresh",  "Background",           "POST",  "/api/auth/refresh",               "all",               120),

            // ── BOOKINGS ─────────────────────────────────────────────────
            new ApiKeyDef("HSP-BOOK-CREATE",   "hsp-book-crt-iX1pF0jVzZ",     "Create Booking (Book Now Button)",  "DiscoverPage Book Now",    "/customer/discover",    "POST",  "/api/bookings",                   "customer",          30),
            new ApiKeyDef("HSP-BOOK-LIST",     "hsp-book-lst-jY0oG1kWaA",     "Get My Bookings List",              "BookingsPage List",        "/customer/bookings",    "GET",   "/api/bookings",                   "customer,provider", 120),
            new ApiKeyDef("HSP-BOOK-GET",      "hsp-book-get-kZ9nH2lXbB",     "Get Single Booking Detail",         "BookingCard Detail",       "/customer/bookings",    "GET",   "/api/bookings/{id}",              "all",               120),
            // IMPORTANT: Customer also calls this endpoint to confirm arrival (Reached_Confirmed).
            // Role scope must include "customer" to avoid breaking if role enforcement is ever added to ApiKeyFilter.
            new ApiKeyDef("HSP-BOOK-STATUS",   "hsp-book-sts-lA8mI3mYcC",     "Update Booking Status Buttons",     "ProviderJobs + TrackingPage", "/provider/jobs,/customer/tracking", "PATCH", "/api/bookings/{id}/status",       "customer,provider,admin", 60),
            new ApiKeyDef("HSP-BOOK-PATCH",    "hsp-book-ptc-mB7lJ4nZdD",     "Patch Booking Fields",              "AdminBookings Edit",       "/admin/bookings",       "PATCH", "/api/bookings/{id}",              "all",               60),
            new ApiKeyDef("HSP-BOOK-RATE",     "hsp-book-rat-nC6kK5oAeE",     "Rate Provider (Star Rating)",       "TrackingPage Stars",       "/customer/tracking",    "POST",  "/api/bookings/{id}/rating",       "customer",          10),

            // ── PROVIDERS ────────────────────────────────────────────────
            new ApiKeyDef("HSP-PROV-LIST",     "hsp-prov-lst-oD5jL6pBfF",     "Search/List Providers",             "DiscoverPage Grid",        "/customer/discover",    "GET",   "/api/providers",                  "public",            120),
            new ApiKeyDef("HSP-PROV-GET",      "hsp-prov-get-pE4iM7qCgG",     "Get Provider Profile",              "ProviderCard Detail",      "/customer/discover",    "GET",   "/api/providers/{id}",             "public",            120),
            new ApiKeyDef("HSP-PROV-NEARBY",   "hsp-prov-nrb-qF3hN8rDhH",    "Get Nearby Providers (Map)",        "MapComponent",             "/customer/discover",    "GET",   "/api/providers/nearby",           "public",            60),
            new ApiKeyDef("HSP-PROV-BLOCK",    "hsp-prov-blk-rG2gO9sEiI",    "Block/Unblock Provider (Admin)",    "AdminProviders Toggle",    "/admin/providers",      "PATCH", "/api/providers/{id}/block",       "admin",             20),
            new ApiKeyDef("HSP-PROV-VERIFY",   "hsp-prov-vfy-tJ2gK9sFkL",    "Verify Provider (Admin)",          "AdminProviders Verify",    "/admin/providers",      "PATCH", "/api/providers/{id}/verify",      "admin",             20),
            new ApiKeyDef("HSP-PROV-DELETE",   "hsp-prov-del-uK3gL8tMvN",    "Delete Provider (Admin)",          "AdminProviders Delete",    "/admin/providers",      "DELETE", "/api/providers/{id}",           "admin",             20),
            new ApiKeyDef("HSP-PROV-AVAIL",    "hsp-prov-avl-sH1fP0tFjJ",    "Toggle Provider Availability",     "ProviderDashboard Switch", "/provider",             "PATCH", "/api/providers/{id}/availability","provider",          30),

            // ── PAYMENTS ─────────────────────────────────────────────────
            new ApiKeyDef("HSP-PAY-PROMO",     "hsp-pay-prm-tI0eQ1uGkK",     "Validate Promo Code Input",         "PromoCodeInput",           "/customer/payments",    "GET",   "/api/payments/promo/{code}",      "customer",          20),
            new ApiKeyDef("HSP-PAY-INITIATE",  "hsp-pay-ini-uJ9dR2vHlL",     "Initiate Payment (Pay Now Button)", "PaymentsPage Pay Btn",     "/customer/payments",    "POST",  "/api/payments/initiate",          "customer",          20),
            new ApiKeyDef("HSP-PAY-VERIFY",    "hsp-pay-vfy-vK8cS3wImM",     "Verify Payment Callback",           "PaymentsPage Verify",      "/customer/payments",    "POST",  "/api/payments/verify",            "customer",          20),

            // ── DISPUTES ─────────────────────────────────────────────────
            new ApiKeyDef("HSP-DISP-CREATE",   "hsp-disp-crt-wL7bT4xJnN",   "File a Dispute (Submit Form)",      "DisputeForm Submit",       "/provider/disputes",    "POST",  "/api/disputes",                   "customer,provider", 10),
            new ApiKeyDef("HSP-DISP-LIST",     "hsp-disp-lst-xM6aU5yKoO",   "List My Disputes",                  "DisputeList",              "/provider/disputes",    "GET",   "/api/disputes",                   "all",               60),
            new ApiKeyDef("HSP-DISP-GET",      "hsp-disp-get-yN5zV6zLpP",   "Get Dispute Detail",                "DisputeCard",              "/admin/disputes",       "GET",   "/api/disputes/{id}",              "all",               60),
            new ApiKeyDef("HSP-DISP-STATUS",   "hsp-disp-sts-zA4yW7aMqQ",   "Resolve/Reject Dispute (Admin)",    "AdminDisputes Actions",    "/admin/disputes",       "PATCH", "/api/disputes/{id}/status",       "admin",             20),
            new ApiKeyDef("HSP-DISP-UPDATE",   "hsp-disp-upd-aB3xX8bNrR",   "Add Dispute Note/Reply",            "DisputeReplyBtn",          "/admin/disputes",       "POST",  "/api/disputes/{id}/updates",      "all",               20),

            // ── LEAVE REQUESTS ───────────────────────────────────────────
            new ApiKeyDef("HSP-LEAV-CREATE",   "hsp-leav-crt-bC2wY9cOsS",   "Submit Leave Request Form",         "LeaveRequestPage Form",    "/provider/leave",       "POST",  "/api/leave",                      "provider",          10),
            new ApiKeyDef("HSP-LEAV-LIST",     "hsp-leav-lst-cD1vZ0dPtT",   "Get Leave Requests List",           "AdminLeavePage Table",     "/admin/leave",          "GET",   "/api/leave",                      "customer,provider,admin",    60),
            new ApiKeyDef("HSP-LEAV-STATUS",   "hsp-leav-sts-dE0uA1eQuU",   "Approve/Reject Leave (Admin)",      "AdminLeavePage Btn",       "/admin/leave",          "PATCH", "/api/leave/{id}/status",          "admin",             20),

            // ── NOTIFICATIONS ────────────────────────────────────────────
            new ApiKeyDef("HSP-NOTIF-LIST",    "hsp-ntf-lst-eF9tB2fRvV",    "Get User Notifications",            "NotificationPanel Fetch",  "All Dashboards",        "GET",   "/api/notifications",              "all",               120),
            new ApiKeyDef("HSP-NOTIF-READ",    "hsp-ntf-rd1-fG8sC3gSwW",    "Mark Single Notification Read",     "NotificationPanel Item",   "All Dashboards",        "PATCH", "/api/notifications/{id}/read",    "all",               60),
            new ApiKeyDef("HSP-NOTIF-READALL", "hsp-ntf-rda-gH7rD4hTxX",   "Mark All Notifications Read",       "Mark All Read Button",     "All Dashboards",        "PATCH", "/api/notifications/read-all",     "all",               20),

            // ── ANALYTICS ────────────────────────────────────────────────
            new ApiKeyDef("HSP-ANLY-GET",      "hsp-anly-get-hI6qE5iUyY",   "Admin Analytics Dashboard",         "AdminAnalytics KPIs",      "/admin/analytics",      "GET",   "/api/analytics",                  "admin",             30),

            // ── CONTACT ──────────────────────────────────────────────────
            new ApiKeyDef("HSP-CONT-CREATE",   "hsp-cont-crt-iJ5pF6jVzZ",   "Submit Contact Form",               "ContactSection Form",      "/ (Landing)",           "POST",  "/api/contact",                    "public",            10),
            new ApiKeyDef("HSP-CONT-LIST",     "hsp-cont-lst-jK4oG7kWaA",   "Admin View Contact Requests",       "AdminRequests Table",      "/admin/requests",       "GET",   "/api/contact",                    "admin",             30),
            new ApiKeyDef("HSP-CONT-STATUS",   "hsp-cont-sts-kL3nH8lXbB",   "Update Contact Request Status",     "AdminRequests Dropdown",   "/admin/requests",       "PATCH", "/api/contact/{id}/status",        "admin",             20),

            // ── GEOCODING ────────────────────────────────────────────────
            new ApiKeyDef("HSP-GEO-REVERSE",   "hsp-geo-rev-lM2mI9mYcC",    "Reverse Geocoding (Location Picker)","LocationModal / CityPicker","/ and Discover",      "GET",   "/api/nominatim/reverse",          "public",            60),

            // ── WEBSOCKET ────────────────────────────────────────────────
            new ApiKeyDef("HSP-WS-LOCATION",   "hsp-ws-loc-mN1lJ0nZdD",     "WebSocket Live Location Feed",      "ProviderLiveLocationBridge","All Dashboards",       "WS",    "/ws/**",                          "all",               300),

            // ── PAYMENTS PROMO CRUD (ADMIN) ──────────────────────────────
            new ApiKeyDef("HSP-PAY-PROMO-LIST",   "hsp-pay-prm-lst-a1b2c3d4e5", "List All Promo Codes (Admin)",    "AdminSettings List",       "/admin/settings",       "GET",    "/api/payments/promo",             "admin",             30),
            new ApiKeyDef("HSP-PAY-PROMO-CREATE", "hsp-pay-prm-crt-f6g7h8i9j0", "Create Promo Code (Admin)",        "AdminSettings Form",       "/admin/settings",       "POST",   "/api/payments/promo",             "admin",             30),
            new ApiKeyDef("HSP-PAY-PROMO-TOGGLE", "hsp-pay-prm-tgl-k1l2m3n4o5", "Toggle Promo Code Active (Admin)",  "AdminSettings Toggle",     "/admin/settings",       "PATCH",  "/api/payments/promo/{id}/active",  "admin",             30),
            new ApiKeyDef("HSP-PAY-PROMO-DELETE", "hsp-pay-prm-del-p6q7r8s9t0", "Delete Promo Code (Admin)",        "AdminSettings Delete",     "/admin/settings",       "DELETE", "/api/payments/promo/{id}",        "admin",             30),

            // ── CHAT ─────────────────────────────────────────────────────
            new ApiKeyDef("HSP-CHAT-GET",         "hsp-chat-get-xP2qR9sTuV",     "Get Chat History",                 "ChatDrawer Load",          "Bookings/Jobs page",   "GET",    "/api/bookings/{id}/chat",         "all",               120),
            new ApiKeyDef("HSP-CHAT-POST",        "hsp-chat-pst-yQ3sS0tUvW",     "Send Chat Message",                "ChatDrawer Form Submit",   "Bookings/Jobs page",   "POST",   "/api/bookings/{id}/chat",         "all",               120),

            // ── CUSTOMER ARCHITECTURE ───────────────────────────────────
            new ApiKeyDef("HSP-CUST-AUTH-VAL",   "hsp-cst-val-aK9mX2bNqR",     "Customer Session Validate",         "AuthContext Init",         "Background",                "GET",   "/api/customer/auth/validate-session", "customer",          120),
            new ApiKeyDef("HSP-CUST-AUTH-RFR",   "hsp-cst-rfr-bQ8wY3cOpS",     "Customer Token Refresh",            "AuthContext Refresh",      "Background",                "POST",  "/api/customer/auth/refresh",          "customer",          120),
            new ApiKeyDef("HSP-CUST-AUTH-LGT",   "hsp-cst-lgt-cR7vZ4dPtT",     "Customer Logout",                   "AuthContext Logout",       "ProfileDrawer",             "POST",  "/api/customer/auth/logout",           "customer",          30),
            new ApiKeyDef("HSP-CUST-DASH-STATS", "hsp-cst-dsh-dS6uA5eQuU",     "Customer Dashboard Stats",          "CustomerDashboard Stats",  "/customer",                 "GET",   "/api/customer/dashboard/stats",       "customer",          120),
            new ApiKeyDef("HSP-CUST-DISC-PROV",  "hsp-cst-dsc-eT5tB6fRvV",     "Customer Discover Providers",       "DiscoverPage Providers",   "/customer/discover",        "GET",   "/api/customer/discover/providers",    "customer",          120),
            new ApiKeyDef("HSP-CUST-BOOK-CREATE","hsp-cst-bcr-fU4sC7gSwW",     "Customer Create Booking",           "DiscoverPage Book Now",    "/customer/discover",        "POST",  "/api/customer/bookings",              "customer",          30),
            new ApiKeyDef("HSP-CUST-BOOK-LIST",  "hsp-cst-bls-gV3rD8hTxX",     "Customer Bookings List",            "BookingsPage List",        "/customer/bookings",        "GET",   "/api/customer/bookings",              "customer",          120),
            new ApiKeyDef("HSP-CUST-BOOK-GET",   "hsp-cst-bgt-hW2qE9iUyY",     "Customer Booking Detail",           "BookingCard Detail",       "/customer/bookings",        "GET",   "/api/customer/bookings/{id}",         "customer",          120),
            new ApiKeyDef("HSP-CUST-BOOK-STATUS","hsp-cst-bst-iX1pF0jVzZ",     "Customer Booking Status Update",    "TrackingPage Action",      "/customer/tracking",        "PATCH", "/api/customer/bookings/{id}/status",  "customer",          60),
            new ApiKeyDef("HSP-CUST-BOOK-RATE",  "hsp-cst-brt-jY0oG1kWaA",     "Customer Booking Rate Provider",    "TrackingPage Stars",       "/customer/tracking",        "POST",  "/api/customer/bookings/{id}/rating",  "customer",          10),
            new ApiKeyDef("HSP-CUST-TRACKING",   "hsp-cst-trk-tracking05",     "Customer Live Tracking Stats",      "TrackingPage Maps",        "/customer/tracking",        "GET",   "/api/customer/tracking/{bookingId}",  "customer",          120),
            new ApiKeyDef("HSP-CUST-PAY-SUMMARY","hsp-cst-pys-summary01",      "Customer Payment Invoice Summary",   "PaymentsPage Summary",     "/customer/payments",        "GET",   "/api/customer/payments/summary",       "customer",          120),
            new ApiKeyDef("HSP-CUST-PAY-INVOICES","hsp-cst-pyi-invoices02",     "Customer Invoices List",            "PaymentsPage Table",       "/customer/payments",        "GET",   "/api/customer/payments/invoices",      "customer",          120),
            new ApiKeyDef("HSP-CUST-PAY-INITIATE","hsp-cst-pyt-initiate03",     "Customer Initiate Payment",         "PaymentsPage Pay Btn",     "/customer/payments",        "POST",  "/api/customer/payments/initiate",      "customer",          20),
            new ApiKeyDef("HSP-CUST-PAY-VERIFY", "hsp-cst-pyv-verify04",       "Customer Verify Payment",           "PaymentsPage Verify",      "/customer/payments",        "POST",  "/api/customer/payments/verify",        "customer",          20),
            new ApiKeyDef("HSP-CUST-PROFILE",    "hsp-cst-prf-oD5jL6pBfF",     "Customer Profile Update",           "ProfilePage Form",         "/customer/profile",         "PATCH", "/api/customer/profile",               "customer",          30)
        );

        int seeded = 0;
        int updated = 0;
        for (ApiKeyDef def : definitions) {
            if (!apiKeyRepository.existsByApiIdentifier(def.identifier())) {
                ApiKey key = ApiKey.builder()
                        .apiIdentifier(def.identifier())
                        .keyValue(def.keyValue())
                        .featureName(def.featureName())
                        .componentName(def.component())
                        .pageName(def.page())
                        .httpMethod(def.method())
                        .endpointPattern(def.endpoint())
                        .allowedRoles(def.roles())
                        .rateLimitPerMinute(def.rateLimit())
                        .active(true)
                        .build();
                apiKeyRepository.save(key);
                seeded++;
            } else {
                // Patch allowedRoles / metadata / key value / pattern on existing keys when definitions change
                apiKeyRepository.findByApiIdentifier(def.identifier()).ifPresent(existing -> {
                    boolean dirty = false;
                    if (!def.keyValue().equals(existing.getKeyValue())) {
                        existing.setKeyValue(def.keyValue());
                        dirty = true;
                    }
                    if (!def.featureName().equals(existing.getFeatureName())) {
                        existing.setFeatureName(def.featureName());
                        dirty = true;
                    }
                    if (!def.method().equals(existing.getHttpMethod())) {
                        existing.setHttpMethod(def.method());
                        dirty = true;
                    }
                    if (!def.endpoint().equals(existing.getEndpointPattern())) {
                        existing.setEndpointPattern(def.endpoint());
                        dirty = true;
                    }
                    if (!def.roles().equals(existing.getAllowedRoles())) {
                        existing.setAllowedRoles(def.roles());
                        dirty = true;
                    }
                    if (!def.component().equals(existing.getComponentName())) {
                        existing.setComponentName(def.component());
                        dirty = true;
                    }
                    if (!def.page().equals(existing.getPageName())) {
                        existing.setPageName(def.page());
                        dirty = true;
                    }
                    if (def.rateLimit() != existing.getRateLimitPerMinute()) {
                        existing.setRateLimitPerMinute(def.rateLimit());
                        dirty = true;
                    }
                    if (dirty) {
                        apiKeyRepository.save(existing);
                    }
                });
                updated++;
            }
        }
        if (seeded > 0) {
            log.info("[API-KEY-SEEDER] ✅ Seeded {} new API keys into HS_API_KEYS", seeded);
        }
        if (updated > 0) {
            log.info("[API-KEY-SEEDER] ✅ Verified/patched {} existing API keys in HS_API_KEYS", updated);
        }
    }

    /** Compact record to hold seed data */
    private record ApiKeyDef(
        String identifier,
        String keyValue,
        String featureName,
        String component,
        String page,
        String method,
        String endpoint,
        String roles,
        int rateLimit
    ) {}
}

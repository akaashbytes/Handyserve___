package com.handyserve.config;

import org.hibernate.dialect.OracleDialect;
import org.hibernate.dialect.DatabaseVersion;

/**
 * Custom Hibernate Dialect to explicitly force compatibility with Oracle 11g (11.2).
 * This locks the generated SQL to use standard rownum-based pagination instead of the 12c+ FETCH FIRST syntax.
 */
public class Oracle11gDialect extends OracleDialect {
    public Oracle11gDialect() {
        super(DatabaseVersion.make(11, 2));
    }
}

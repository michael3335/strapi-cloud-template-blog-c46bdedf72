// config/database.js
/**
 * Database configuration
 *
 * ┌────────────────────────────────────────────────────┐
 * │  Local DEV  ➜  uses  DATABASE_URL if provided     │
 * │  Otherwise  ➜  falls back to SQLite (.tmp/data.db)│
 * │  Cloud PROD ➜  Strapi Cloud injects DATABASE_URL  │
 * └────────────────────────────────────────────────────┘
 */

const path = require("path");
const { parse } = require("pg-connection-string");

module.exports = ({ env }) => {
  /**
   * Prefer the explicit DATABASE_CLIENT env, else auto-select:
   * • if DATABASE_URL exists ➜ postgres
   * • otherwise ➜ sqlite (local, zero-config)
   */
  const client =
    env("DATABASE_CLIENT") || (env("DATABASE_URL") ? "postgres" : "sqlite");

  /** ──────────────────────────────────────────────────────────
   *  Per-client connection blocks
   *  Edit only the ones you need; others stay for flexibility
   *  ────────────────────────────────────────────────────────── */
  const connections = {
    /**  Postgres (local Docker or Strapi Cloud)  */
    postgres: {
      connection: (() => {
        // If DATABASE_URL is set, parse it; else read discrete vars
        if (env("DATABASE_URL")) {
          const { host, port, database, user, password } = parse(
            env("DATABASE_URL")
          );
          return {
            host,
            port: Number(port) || 5432,
            database,
            user,
            password,
            ssl: env.bool("DATABASE_SSL", false) && {
              rejectUnauthorized: env.bool(
                "DATABASE_SSL_REJECT_UNAUTHORIZED",
                true
              ),
            },
            schema: env("DATABASE_SCHEMA", "public"),
          };
        }

        // Fallback manual config (rarely used once DATABASE_URL is set)
        return {
          host: env("DATABASE_HOST", "localhost"),
          port: env.int("DATABASE_PORT", 5432),
          database: env("DATABASE_NAME", "strapi"),
          user: env("DATABASE_USERNAME", "strapi"),
          password: env("DATABASE_PASSWORD", "strapi"),
          ssl: env.bool("DATABASE_SSL", false) && {
            rejectUnauthorized: env.bool(
              "DATABASE_SSL_REJECT_UNAUTHORIZED",
              true
            ),
          },
          schema: env("DATABASE_SCHEMA", "public"),
        };
      })(),
      pool: {
        min: env.int("DATABASE_POOL_MIN", 2),
        max: env.int("DATABASE_POOL_MAX", 10),
      },
    },

    /**  SQLite (zero-dep local fallback)  */
    sqlite: {
      connection: {
        filename: path.join(
          __dirname,
          "..",
          env("DATABASE_FILENAME", ".tmp/data.db")
        ),
      },
      useNullAsDefault: true,
    },

    /**  MySQL block retained for future flexibility  */
    mysql: {
      connection: {
        host: env("DATABASE_HOST", "localhost"),
        port: env.int("DATABASE_PORT", 3306),
        database: env("DATABASE_NAME", "strapi"),
        user: env("DATABASE_USERNAME", "strapi"),
        password: env("DATABASE_PASSWORD", "strapi"),
        ssl: env.bool("DATABASE_SSL", false) && {
          key: env("DATABASE_SSL_KEY", undefined),
          cert: env("DATABASE_SSL_CERT", undefined),
          ca: env("DATABASE_SSL_CA", undefined),
          capath: env("DATABASE_SSL_CAPATH", undefined),
          cipher: env("DATABASE_SSL_CIPHER", undefined),
          rejectUnauthorized: env.bool(
            "DATABASE_SSL_REJECT_UNAUTHORIZED",
            true
          ),
        },
      },
      pool: {
        min: env.int("DATABASE_POOL_MIN", 2),
        max: env.int("DATABASE_POOL_MAX", 10),
      },
    },
  };

  return {
    connection: {
      client,
      ...connections[client],
      acquireConnectionTimeout: env.int("DATABASE_CONNECTION_TIMEOUT", 60000),
    },
  };
};

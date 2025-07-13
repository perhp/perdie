import { Database } from "bun:sqlite";

export const db = new Database("db.sqlite", { create: true });

db.exec(`
  PRAGMA foreign_keys = ON;

  BEGIN;

  -- ---------------- climate_readings ----------------
  CREATE TABLE IF NOT EXISTS climate_readings (
      id           INTEGER PRIMARY KEY,
      ens_status   INTEGER NOT NULL                  -- 0-6 from the BME680 driver, for example
                     CHECK(ens_status BETWEEN 0 AND 6),
      temperature  REAL    NOT NULL CHECK(temperature BETWEEN -50 AND 100),
      pressure     REAL,
      altitude     REAL,
      humidity     REAL    CHECK(humidity BETWEEN 0 AND 100),
      aqi          REAL,
      tvoc         REAL,
      eco2         REAL,
      created_at   TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
  );
  CREATE INDEX IF NOT EXISTS climate_readings_created_at_idx
      ON climate_readings(created_at);

  -- ---------------- usage ----------------
  CREATE TABLE IF NOT EXISTS usage (
      id               INTEGER PRIMARY KEY,
      cpu_temperature  REAL,
      cpu_usage        REAL CHECK(cpu_usage BETWEEN 0 AND 100),
      uptime           INTEGER,                               -- seconds
      memory_total     REAL,
      memory_used      REAL,
      memory_free      REAL,
      memory_shared    REAL,
      memory_buff_cache REAL,
      memory_available REAL,
      voltage          REAL,
      created_at       TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
  );
  CREATE INDEX IF NOT EXISTS usage_created_at_idx ON usage(created_at);

  COMMIT;
`);

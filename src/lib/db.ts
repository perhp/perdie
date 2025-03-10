import { Database } from "bun:sqlite";

export const db = new Database(":memory:");

db.exec(`
    CREATE TABLE IF NOT EXISTS climate_readings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ensStatus INTEGER,
        temperature REAL,
        pressure REAL,
        altitude REAL,
        humidity REAL,
        aqi REAL,
        tvoc REAL,
        eco2 REAL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
`);

db.exec(`
    CREATE TABLE IF NOT EXISTS usage (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        cpu_temperature REAL,
        cpu_usage REAL,
        uptime INTEGER,
        memory_total REAL,
        memory_used REAL,
        memory_free REAL,
        memory_shared REAL,
        memory_buff_cache REAL,
        memory_available REAL,
        voltage REAL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
`);

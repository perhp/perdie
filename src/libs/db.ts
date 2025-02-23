import { Database } from "bun:sqlite";

export const db = new Database(":memory:");
db.exec(`
    CREATE TABLE IF NOT EXISTS sensors (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ensStatus INTEGER,
        temperature REAL,
        pressure REAL,
        altitude REAL,
        humidity REAL,
        aqi REAL,
        tvoc REAL,
        eco2 REAL
    )
`);

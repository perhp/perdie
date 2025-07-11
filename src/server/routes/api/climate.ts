import { db } from "@/lib/db";
import { RouteMap } from "@/models/route.model";
import { ClimateReading } from "@/models/sensor.model";

const maxAge = 1000 * 60 * 60 * 12;

export default {
  "/api/climate-readings": {
    async GET() {
      const readings = db
        .prepare("SELECT * FROM climate_readings ORDER BY createdAt DESC")
        .all() as ClimateReading[];
      return new Response(JSON.stringify(readings.reverse()), {
        headers: { "content-type": "application/json" },
      });
    },
    async POST(req) {
      const body: ClimateReading = await req.json();
      db.prepare(
        "INSERT INTO climate_readings (ensStatus, temperature, pressure, altitude, humidity, aqi, tvoc, eco2, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      ).run(
        body.ensStatus,
        body.temperature,
        body.pressure,
        body.altitude,
        body.humidity,
        body.aqi,
        body.tvoc,
        body.eco2,
        new Date().toISOString(),
      );

      db.prepare("DELETE FROM climate_readings WHERE createdAt < ?").run(
        new Date(Date.now() - maxAge).toISOString(),
      );

      console.log("Inserted new climate reading:", body);
      return Response.json(body);
    },
  },
} satisfies RouteMap;

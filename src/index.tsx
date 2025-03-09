import { serve } from "bun";
import {
  getCPUTemperatureAsync,
  getCPUUsageAsync,
  getMemoryUsageAsync,
  getUptimeAsync,
  getVoltageAsync,
} from "raspberry-stats";
import index from "./index.html";
import { db } from "./lib/db";
import { ClimateReading } from "./models/sensor.model";
import { Usage } from "./models/usage.model";

const server = serve({
  routes: {
    // Serve the index.html file for all routes
    "/*": index,

    // API endpoints
    "/api/usage": {
      async GET() {
        const { data: cpuTemperature } = await getCPUTemperatureAsync();
        const { data: cpuUsage } = await getCPUUsageAsync();
        const { data: uptime } = await getUptimeAsync();
        const { data: memory } = await getMemoryUsageAsync();
        const { data: voltage } = await getVoltageAsync();

        return Response.json({
          cpu: {
            temperature: cpuTemperature ?? 0,
            usage: cpuUsage ?? 0,
          },
          uptime: uptime ?? 0,
          memory: memory ?? {
            total: 0,
            used: 0,
            free: 0,
            shared: 0,
            buffCache: 0,
            available: 0,
          },
          voltage: voltage ?? 0,
        } satisfies Usage);
      },
    },

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
          new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
        );

        console.log("Inserted new climate reading:", body);
        return Response.json(body);
      },
    },
  },

  development: process.env.NODE_ENV !== "production",
});

console.log(`🚀 Server running at ${server.url}`);

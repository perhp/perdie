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

const maxAge = 1000 * 60 * 60 * 6; // 6 hours

const server = serve({
  routes: {
    // Serve the index.html file for all routes
    "/*": index,

    // API endpoints
    "/api/usages": {
      async GET() {
        const { data: cpuTemperature } = await getCPUTemperatureAsync();
        const { data: cpuUsage } = await getCPUUsageAsync();
        const { data: uptime } = await getUptimeAsync();
        const { data: memory } = await getMemoryUsageAsync();
        const { data: voltage } = await getVoltageAsync();

        const latestUsage: Usage = {
          cpu_temperature: cpuTemperature ?? 0,
          cpu_usage: cpuUsage ?? 0,
          uptime: uptime ?? 0,
          memory_total: memory?.total ?? 0,
          memory_used: memory?.used ?? 0,
          memory_free: memory?.free ?? 0,
          memory_shared: memory?.shared ?? 0,
          memory_buffCache: memory?.buffCache ?? 0,
          memory_available: memory?.available ?? 0,
          voltage: voltage ?? 0,
        };

        db.prepare(
          "INSERT INTO usage (cpu_temperature, cpu_usage, uptime, memory_total, memory_used, memory_free, memory_shared, memory_buff_cache, memory_available, voltage, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        ).run(
          latestUsage.cpu_temperature,
          latestUsage.cpu_usage,
          latestUsage.uptime,
          latestUsage.memory_total,
          latestUsage.memory_used,
          latestUsage.memory_free,
          latestUsage.memory_shared,
          latestUsage.memory_buffCache,
          latestUsage.memory_available,
          latestUsage.voltage,
          new Date().toISOString(),
        );

        db.prepare("DELETE FROM usage WHERE createdAt < ?").run(
          new Date(Date.now() - maxAge).toISOString(),
        );

        const usages = db
          .prepare("SELECT * FROM usage ORDER BY createdAt DESC")
          .all() as Usage[];

        return new Response(JSON.stringify(usages.reverse()), {
          headers: { "content-type": "application/json" },
        });
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
          new Date(Date.now() - maxAge).toISOString(),
        );

        console.log("Inserted new climate reading:", body);
        return Response.json(body);
      },
    },
  },

  development: process.env.NODE_ENV !== "production",
});

console.log(`🚀 Server running at ${server.url}`);

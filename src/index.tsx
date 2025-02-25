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
        try {
          return Response.json({
            cpu: {
              temperature: await getCPUTemperatureAsync(),
              usage: await getCPUUsageAsync(),
            },
            uptime: await getUptimeAsync(),
            memory: await getMemoryUsageAsync(),
            voltage: await getVoltageAsync(),
          } satisfies Usage);
        } catch (err) {
          return Response.json({
            cpu: {
              temperature: 38.4,
              usage: 51.23,
            },
            uptime: 30009360,
            memory: {
              total: 4148112,
              used: 850048,
              free: 2148672,
              shared: 89984,
              buffCache: 1312752,
              available: 3298064,
            },
            voltage: 0.72,
          } satisfies Usage);
        }
      },
    },

    "/api/climate-readings": {
      async GET() {
        const readings = db
          .prepare(
            "SELECT * FROM climate_readings ORDER BY createdAt DESC LIMIT 240",
          )
          .all() as ClimateReading[];
        return new Response(JSON.stringify(readings.reverse()), {
          headers: { "content-type": "application/json" },
        });
      },
      async POST(req) {
        const body: ClimateReading = await req.json();
        db.prepare(
          "INSERT INTO climate_readings (ensStatus, temperature, pressure, altitude, humidity, aqi, tvoc, eco2) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        ).run(
          body.ensStatus,
          body.temperature,
          body.pressure,
          body.altitude,
          body.humidity,
          body.aqi,
          body.tvoc,
          body.eco2,
        );
        console.log("Inserted new climate reading:", body);
        return Response.json(body);
      },
    },
  },

  development: process.env.NODE_ENV !== "production",
});

console.log(`🚀 Server running at ${server.url}`);

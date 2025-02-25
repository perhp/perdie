import { serve } from "bun";
import index from "./index.html";
import { db } from "./lib/db";
import { ClimateReading } from "./models/sensor.model";
import {
  getCPUTemperatureAsync,
  getMemoryUsageAsync,
  getCPUUsageAsync,
  getUptimeAsync,
  getVoltageAsync,
} from "raspberry-stats";

const server = serve({
  routes: {
    // Serve the index.html file for all routes
    "/*": index,

    // API endpoints
    "/api/usage": {
      async GET() {
        return Response.json({
          cpu: {
            temperature: await getCPUTemperatureAsync(),
            usage: await getCPUUsageAsync(),
          },
          uptime: await getUptimeAsync(),
          memory: await getMemoryUsageAsync(),
          voltage: await getVoltageAsync(),
        });
      },
    },

    "/api/climate-readings": {
      async GET() {
        const readings = db
          .prepare(
            "SELECT * FROM climate_readings ORDER BY createdAt DESC LIMIT 50",
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

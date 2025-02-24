import { serve } from "bun";
import index from "./index.html";
import { db } from "./lib/db";
import { ClimateReading } from "./models/sensor.model";

const server = serve({
  routes: {
    // Serve the index.html file for all routes
    "/*": index,

    // API endpoints
    "/api/climate-readings": {
      async GET() {
        const readings = db
          .prepare("SELECT * FROM climate_readings ORDER BY createdAt ASC")
          .all() as ClimateReading[];
        return new Response(JSON.stringify(readings), {
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

  port: process.env.NODE_ENV === "production" ? 80 : undefined,
});

console.log(`🚀 Server running at ${server.url}`);

import { serve } from "bun";
import index from "./index.html";
import { db } from "./libs/db";
import { Climate } from "./models/sensor.model";

const server = serve({
  routes: {
    // Serve the index.html file for all routes
    "/*": index,

    // API endpoints
    "/api/sensors": {
      async POST(req) {
        const body: Climate = await req.json();
        db.prepare(
          "INSERT INTO climate (ensStatus, temperature, pressure, altitude, humidity, aqi, tvoc, eco2) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
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
        return new Response("OK");
      },
    },
  },

  development: process.env.NODE_ENV !== "production",
});

console.log(`🚀 Server running at ${server.url}`);

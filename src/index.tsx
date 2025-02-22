import { serve } from "bun";
import index from "./index.html";

const server = serve({
  routes: {
    // Serve the index.html file for all routes
    "/*": index,

    // API endpoints
    "/api/sensors": {
      async POST(req) {
        const body = await req.json();
        console.log("Sensor data received", body);
        return new Response("OK");
      }
    }
  },

  development: process.env.NODE_ENV !== "production",
});

console.log(`🚀 Server running at ${server.url}`);

import { serve } from "bun";
import buildRoutes from "./routes";

const server = serve({
  routes: buildRoutes(),
  development: process.env.NODE_ENV !== "production",
});

console.log(`🚀  Listening on ${server.url}`);

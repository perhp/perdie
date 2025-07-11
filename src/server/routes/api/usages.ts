import { db } from "@/lib/db";
import { RouteMap } from "@/models/route.model";
import { Usage } from "@/models/usage.model";
import {
  getCPUTemperatureAsync,
  getCPUUsageAsync,
  getMemoryUsageAsync,
  getUptimeAsync,
  getVoltageAsync,
} from "raspberry-stats";

const maxAge = 1000 * 60 * 60;

export default {
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
} satisfies RouteMap;

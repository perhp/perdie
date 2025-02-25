export interface Usage {
  cpu: {
    temperature: number;
    usage: number;
  };
  uptime: number;
  memory: {
    total: number;
    used: number;
    free: number;
    shared: number;
    buffCache: number;
    available: number;
  };
  voltage: number;
}

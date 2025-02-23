export interface ClimateReading {
  id: number;
  ensStatus: number;
  temperature: number;
  pressure: number;
  altitude: number;
  humidity: number;
  aqi: number;
  tvoc: number;
  eco2: number;
  createdAt: string;
}

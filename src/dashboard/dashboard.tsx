import { ClimateReading } from "@/models/sensor.model";
import { useQuery } from "@tanstack/react-query";

function useClimateReadings() {
  return useQuery({
    queryKey: ["climate-readings"],
    queryFn: async (): Promise<Array<ClimateReading>> => {
      const response = await fetch("/api/climate-readings");
      return await response.json();
    },
  });
}

export default function Dashboard() {
  const { data: readings } = useClimateReadings();
  return (
    <div className="max-w-7xl mx-auto p-8 text-center relative z-10">
      <h1 className="text-amber-950 text-5xl font-bold my-4 leading-tight">
        Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {readings?.map((reading) => (
          <div
            key={reading.id}
            className="bg-white rounded-lg shadow-lg p-4 flex flex-col justify-between"
          >
            <div>
              <h2 className="text-amber-950 text-2xl font-bold">
                {reading.temperature.toFixed(1)}°C
              </h2>
              <p className="text-gray-500">
                {reading.humidity.toFixed(2)}% humidity, {reading.pressure} hPa
              </p>
            </div>
            <div className="mt-4">
              <p className="text-gray-500">
                AQI: {reading.aqi}, eCO2: {reading.eco2}, TVOC: {reading.tvoc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

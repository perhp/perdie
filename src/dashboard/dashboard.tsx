import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { ClimateReading } from "@/models/sensor.model";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Line, LineChart } from "recharts";

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "hsl(var(--chart-1))",
  },
  mobile: {
    label: "Mobile",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

function useClimateReadings() {
  return useQuery({
    queryKey: ["climate-readings"],
    queryFn: async (): Promise<Array<ClimateReading>> => {
      const response = await fetch("/api/climate-readings");
      return await response.json();
    },
    refetchInterval: 10000,
    refetchIntervalInBackground: true,
  });
}

export default function Dashboard() {
  const { data: readings, isLoading, isError } = useClimateReadings();

  if (isLoading) {
    return <div>Loading..</div>;
  }

  if (isError || !readings) {
    return <div>Error</div>;
  }

  const chartData = readings.map((reading) => ({
    createdAt: format(new Date(reading.createdAt), "HH:mm"),
    temperature: +reading.temperature.toFixed(1),
    humidity: +reading.humidity.toFixed(1),
    pressure: +reading.pressure.toFixed(0),
    aqi: reading.aqi,
    tvoc: reading.tvoc,
    eco2: reading.eco2,
  }));

  const latestReading = readings.at(-1);

  return (
    <div className="relative z-10 p-8 mx-auto max-w-7xl">
      <h1 className="my-4 text-5xl font-bold leading-tight text-amber-950">
        Dashboard
      </h1>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="gap-0">
            <CardTitle className="font-semibold text-sm">Temperature</CardTitle>
            <CardDescription className="text-2xl font-extrabold">
              {latestReading?.temperature.toFixed(1)}°C
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[80px] w-full">
              <LineChart
                accessibilityLayer
                data={chartData}
                margin={{
                  top: 20,
                  left: 12,
                  right: 12,
                }}
              >
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      indicator="line"
                      className="bg-white"
                    />
                  }
                />
                <Line
                  dataKey="temperature"
                  type="natural"
                  stroke="var(--color-red-800)"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="gap-0">
            <CardTitle className="font-semibold text-sm">Humidity</CardTitle>
            <CardDescription className="text-2xl font-extrabold">
              {latestReading?.humidity.toFixed(1)}%
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[80px] w-full">
              <LineChart
                accessibilityLayer
                data={chartData}
                margin={{
                  top: 20,
                  left: 12,
                  right: 12,
                }}
              >
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      indicator="line"
                      className="bg-white"
                    />
                  }
                />
                <Line
                  dataKey="humidity"
                  type="natural"
                  stroke="var(--color-blue-800)"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="gap-0">
            <CardTitle className="font-semibold text-sm">Pressure</CardTitle>
            <CardDescription className="text-2xl font-extrabold">
              {latestReading?.pressure}Pa
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[80px] w-full">
              <LineChart
                accessibilityLayer
                data={chartData}
                margin={{
                  top: 20,
                  left: 12,
                  right: 12,
                }}
              >
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      indicator="line"
                      className="bg-white"
                    />
                  }
                />
                <Line
                  dataKey="pressure"
                  type="natural"
                  stroke="var(--color-yellow-800)"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="gap-0">
            <CardTitle className="font-semibold text-sm">TVOC</CardTitle>
            <CardDescription className="text-2xl font-extrabold">
              {latestReading?.tvoc}ppb
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[80px] w-full">
              <LineChart
                accessibilityLayer
                data={chartData}
                margin={{
                  top: 20,
                  left: 12,
                  right: 12,
                }}
              >
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      indicator="line"
                      className="bg-white"
                    />
                  }
                />
                <Line
                  dataKey="tvoc"
                  type="natural"
                  stroke="var(--color-gray-800)"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="gap-0">
            <CardTitle className="font-semibold text-sm">eCO2</CardTitle>
            <CardDescription className="text-2xl font-extrabold">
              {latestReading?.eco2}ppm
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[80px] w-full">
              <LineChart
                accessibilityLayer
                data={chartData}
                margin={{
                  top: 20,
                  left: 12,
                  right: 12,
                }}
              >
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      indicator="line"
                      className="bg-white"
                    />
                  }
                />
                <Line
                  dataKey="eco2"
                  type="natural"
                  stroke="var(--color-green-800)"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="gap-0">
            <CardTitle className="font-semibold text-sm">AQI</CardTitle>
            <CardDescription className="text-2xl font-extrabold">
              {latestReading?.aqi}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[80px] w-full">
              <LineChart
                accessibilityLayer
                data={chartData}
                margin={{
                  top: 20,
                  left: 12,
                  right: 12,
                }}
              >
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      indicator="line"
                      className="bg-white"
                    />
                  }
                />
                <Line
                  dataKey="aqi"
                  type="linear"
                  stroke="var(--color-green-800)"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

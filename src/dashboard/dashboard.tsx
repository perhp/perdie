import {
  Card,
  CardContent,
  CardDescription,
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
import { Usage } from "@/models/usage.model";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Activity, Cpu, Github, MemoryStick, Zap } from "lucide-react";
import { Line, LineChart, YAxis } from "recharts";

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

function useUsage() {
  return useQuery({
    queryKey: ["usage"],
    queryFn: async (): Promise<Usage> => {
      const response = await fetch("/api/usage");
      return await response.json();
    },
    refetchInterval: 10000,
    refetchIntervalInBackground: true,
  });
}

export default function Dashboard() {
  const {
    data: readings,
    isLoading: climateReadingsIsLoading,
    isError: climateReadingsIsError,
  } = useClimateReadings();

  const {
    data: usage,
    isLoading: usageIsLoading,
    isError: usageIsError,
  } = useUsage();

  if (climateReadingsIsLoading || usageIsLoading) {
    return <div>Loading..</div>;
  }

  if (climateReadingsIsError || usageIsError || !readings || !usage) {
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

  return (
    <>
      <div className="flex items-center h-10 px-8 text-sm font-medium text-gray-100 bg-slate-900 col-span-full">
        <Cpu className="mr-1 size-4" /> {usage.cpu.usage.toFixed(1)}%
        {usage.cpu.temperature > 0 && <> at {usage.cpu.temperature}°C</>}
        <div className="px-4 font-medium" />
        <MemoryStick className="mr-1 size-4" />{" "}
        {((usage.memory.used / usage.memory.total) * 100).toFixed(2)}% of{" "}
        {(usage.memory.total / 1024).toFixed(0)} MB
        <div className="px-4 font-medium" />
        <Activity className="mr-1 size-4" />{" "}
        {(usage.uptime / 1000 / 60).toFixed(0)} minutes
        {usage.voltage > 0 && (
          <>
            <div className="px-4 font-medium" />
            <Zap className="mr-1 size-4" /> {usage.voltage}V
          </>
        )}
        <a href="https://github.com/perhp" target="_blank" className="ml-auto">
          <Github className="size-4" />
        </a>
      </div>
      <div className="grid min-h-[calc(100vh_-_2.5rem)] grid-cols-1 gap-0.5 bg-slate-900 md:grid-cols-2 lg:grid-cols-3 overflow-hidden">
        <Chart title="AQI" chartData={chartData} property="aqi" />
        <Chart
          title="Temperature"
          chartData={chartData}
          property="temperature"
          functionalUnit="°C"
        />
        <Chart
          title="Humidity"
          chartData={chartData}
          property="humidity"
          functionalUnit="%"
        />
        <Chart
          title="Pressure"
          chartData={chartData}
          property="pressure"
          functionalUnit="Pa"
        />
        <Chart
          title="TVOC"
          chartData={chartData}
          property="tvoc"
          functionalUnit="ppb"
        />
        <Chart
          title="eCO2"
          chartData={chartData}
          property="eco2"
          functionalUnit="ppm"
        />
      </div>
    </>
  );
}

function Chart({
  title,
  chartData,
  property,
  functionalUnit,
}: {
  title: string;
  chartData: any[];
  property: string;
  functionalUnit?: string;
}) {
  const latestReading = chartData.at(-1);

  const findMinAndMax = (
    data: typeof chartData,
    key: keyof (typeof chartData)[number],
  ) => {
    const values = data.map((d) => d[key]);
    return [
      Math.min(...(values as number[])),
      Math.max(...(values as number[])),
    ];
  };

  return (
    <Card className="h-full px-2 py-8 text-white border-none rounded-none shadow-none bg-slate-800">
      <CardHeader className="gap-0">
        <CardTitle className="font-semibold text-gray-300">{title}</CardTitle>
        <CardDescription className="font-extrabold text-7xl">
          {latestReading?.[property]}
          <span className="text-4xl font-bold">{functionalUnit ?? ""}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="mt-6 -mx-8">
        <ChartContainer config={chartConfig} className="w-full h-[25vh]">
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{
              top: 5,
              bottom: 5,
              left: 5,
              right: 5,
            }}
          >
            <YAxis hide={true} domain={findMinAndMax(chartData, property)} />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  indicator="line"
                  className="text-black bg-white"
                />
              }
            />
            <Line
              dataKey={property}
              type="bump"
              stroke="var(--color-white)"
              strokeWidth={4}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

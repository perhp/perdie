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
import { Activity, Cpu, MemoryStick, Zap } from "lucide-react";
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
    <div className="grid min-h-screen grid-cols-1 gap-1 bg-gray-300 md:grid-cols-2 lg:grid-cols-3">
      <div className="flex items-center px-8 text-sm font-medium bg-white col-span-full">
        <Cpu className="size-4 mr-1" /> {usage.cpu.usage.toFixed(1)}% at{" "}
        {usage.cpu.temperature}°C
        <div className="px-4 font-medium" />
        <MemoryStick className="size-4 mr-1" />{" "}
        {((usage.memory.used / usage.memory.total) * 100).toFixed(2)}% of{" "}
        {(usage.memory.total / 1024).toFixed(0)} MB
        <div className="px-4 font-medium" />
        <Activity className="size-4 mr-1" />{" "}
        {(usage.uptime / 1000 / 60).toFixed(0)} minutes
        <div className="px-4 font-medium" />
        <Zap className="size-4 mr-1" /> {usage.voltage}V
      </div>
      <Chart
        title="AQI"
        color="var(--color-purple-800)"
        chartData={chartData}
        property="aqi"
      />
      <Chart
        title="Temperature"
        color="var(--color-red-800)"
        chartData={chartData}
        property="temperature"
        functionalUnit="°C"
      />
      <Chart
        title="Humidity"
        color="var(--color-blue-800)"
        chartData={chartData}
        property="humidity"
        functionalUnit="%"
      />
      <Chart
        title="Pressure"
        color="var(--color-yellow-800)"
        chartData={chartData}
        property="pressure"
        functionalUnit="Pa"
      />
      <Chart
        title="TVOC"
        color="var(--color-gray-800)"
        chartData={chartData}
        property="tvoc"
        functionalUnit="ppb"
      />
      <Chart
        title="eCO2"
        color="var(--color-blue-800)"
        chartData={chartData}
        property="eco2"
        functionalUnit="ppm"
      />
    </div>
  );
}

function Chart({
  title,
  color,
  chartData,
  property,
  functionalUnit,
}: {
  title: string;
  color: string;
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
    <Card className="h-full px-2 py-8 bg-white border-none rounded-none shadow-none">
      <CardHeader className="gap-0">
        <CardTitle className="font-semibold">{title}</CardTitle>
        <CardDescription className="font-extrabold text-7xl">
          {latestReading?.[property]}
          {functionalUnit ?? ""}
        </CardDescription>
      </CardHeader>
      <CardContent>
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
                <ChartTooltipContent indicator="line" className="bg-white" />
              }
            />
            <Line
              dataKey={property}
              type="linear"
              stroke={color}
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

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
import { TrendingUp } from "lucide-react";
import { CartesianGrid, LabelList, Line, LineChart, XAxis } from "recharts";

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
  });
}

export default function Dashboard() {
  const { data: readings } = useClimateReadings();

  const chartData = readings?.map((reading) => ({
    createdAt: new Date(reading.createdAt).toLocaleString("default"),
    temperature: reading.temperature,
  }));

  return (
    <div className="max-w-7xl mx-auto p-8 text-center relative z-10">
      <h1 className="text-amber-950 text-5xl font-bold my-4 leading-tight">
        Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Temperature</CardTitle>
            <CardDescription>Last hour</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <LineChart
                accessibilityLayer
                data={chartData}
                margin={{
                  top: 20,
                  left: 12,
                  right: 12,
                }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="createdAt"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="line" />}
                />
                <Line
                  dataKey="temperature"
                  type="natural"
                  stroke="var(--color-desktop)"
                  strokeWidth={2}
                  dot={{
                    fill: "var(--color-desktop)",
                  }}
                  activeDot={{
                    r: 6,
                  }}
                >
                  <LabelList
                    position="top"
                    offset={12}
                    className="fill-foreground"
                    fontSize={12}
                  />
                </Line>
              </LineChart>
            </ChartContainer>
          </CardContent>
          <CardFooter className="flex-col items-start gap-2 text-sm">
            <div className="flex gap-2 font-medium leading-none">
              Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
            </div>
            <div className="leading-none text-muted-foreground">
              Showing temperature readings for the last hour
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

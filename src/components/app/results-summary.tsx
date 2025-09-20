
"use client";

import { useMemo, useState, useEffect } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Cell } from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { ProcessedRow } from "@/lib/definitions";
import { Skeleton } from "@/components/ui/skeleton";


interface ResultsSummaryProps {
  data: ProcessedRow[];
}

const getPollutionColor = (level: string) => {
    switch (level) {
        case "High":
            return "hsl(var(--destructive))";
        case "Medium":
            return "hsl(var(--chart-4))";
        case "Low":
        default:
            return "hsl(var(--chart-2))";
    }
};

const ClientOnlyChart = ({ children }: { children: React.ReactNode }) => {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return <Skeleton className="h-[250px] w-full" />;
  }

  return <>{children}</>;
};

export default function ResultsSummary({ data }: ResultsSummaryProps) {
  const summary = useMemo(() => {
    if (!data || data.length === 0) {
      return {
        totalSamples: 0,
        averageHmpi: 0,
        minHmpi: 0,
        maxHmpi: 0,
        pollutionCounts: { Low: 0, Medium: 0, High: 0 },
      };
    }

    const hmpis = data.map((d) => parseFloat(d.hmpi)).filter((v) => !isNaN(v));
    const totalSamples = data.length;
    const averageHmpi = hmpis.reduce((a, b) => a + b, 0) / hmpis.length;
    const minHmpi = Math.min(...hmpis);
    const maxHmpi = Math.max(...hmpis);

    const pollutionCounts = data.reduce(
      (acc, row) => {
        const level = row.pollutionLevel;
        if (level === "Low" || level === "Medium" || level === "High") {
          acc[level]++;
        }
        return acc;
      },
      { Low: 0, Medium: 0, High: 0 }
    );

    return {
      totalSamples,
      averageHmpi: parseFloat(averageHmpi.toFixed(2)),
      minHmpi: parseFloat(minHmpi.toFixed(2)),
      maxHmpi: parseFloat(maxHmpi.toFixed(2)),
      pollutionCounts,
    };
  }, [data]);

  const chartData = [
    { level: "Low", count: summary.pollutionCounts.Low, fill: "var(--color-low)" },
    { level: "Medium", count: summary.pollutionCounts.Medium, fill: "var(--color-medium)" },
    { level: "High", count: summary.pollutionCounts.High, fill: "var(--color-high)" },
  ];

  const chartConfig = {
    count: {
      label: "Samples",
    },
    hmpi: {
      label: "HMPI",
    },
    low: {
      label: "Low",
      color: "hsl(var(--chart-2))",
    },
    medium: {
      label: "Medium",
      color: "hsl(var(--chart-4))",
    },
    high: {
      label: "High",
      color: "hsl(var(--destructive))",
    },
  };

  const locationChartData = useMemo(() => {
    return data.map(row => ({
        name: row.location_name || `Sample ${row.id}`,
        hmpi: parseFloat(row.hmpi),
        level: row.pollutionLevel,
    })).sort((a, b) => a.hmpi - b.hmpi);
  }, [data]);

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader>
          <CardTitle>Total Samples</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold">{summary.totalSamples}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Average HMPI</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold">{summary.averageHmpi}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Min HMPI</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold">{summary.minHmpi}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Max HMPI</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold">{summary.maxHmpi}</p>
        </CardContent>
      </Card>
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Pollution Level Distribution</CardTitle>
          <CardDescription>
            Count of samples by pollution level.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ClientOnlyChart>
            <ChartContainer config={chartConfig} className="h-[250px] w-full">
              <BarChart accessibilityLayer data={chartData} layout="vertical">
                <CartesianGrid horizontal={false} />
                <YAxis
                  dataKey="level"
                  type="category"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                />
                <XAxis dataKey="count" type="number" hide />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Bar dataKey="count" radius={8} layout="vertical">
                   {chartData.map((entry) => (
                      <Cell key={`cell-${entry.level}`} fill={getPollutionColor(entry.level)} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </ClientOnlyChart>
        </CardContent>
      </Card>
      <Card className="md:col-span-2">
        <CardHeader>
            <CardTitle>HMPI by Location</CardTitle>
            <CardDescription>Heavy Metal Pollution Index for each sample location.</CardDescription>
        </CardHeader>
        <CardContent>
          <ClientOnlyChart>
            <ChartContainer config={chartConfig} className="h-[250px] w-full">
                <BarChart accessibilityLayer data={locationChartData}>
                    <CartesianGrid vertical={false} />
                    <XAxis 
                        dataKey="name"
                        tickLine={false}
                        tickMargin={10}
                        axisLine={false}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                        interval={0}
                    />
                    <YAxis dataKey="hmpi" />
                    <ChartTooltip 
                        cursor={false}
                        content={<ChartTooltipContent />} 
                    />
                    <Bar dataKey="hmpi" radius={8}>
                        {locationChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={getPollutionColor(entry.level)} />
                        ))}
                    </Bar>
                </BarChart>
            </ChartContainer>
          </ClientOnlyChart>
        </CardContent>
      </Card>
    </div>
  );
}


"use client";

import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
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

interface ResultsSummaryProps {
  data: ProcessedRow[];
}

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
      <Card className="md:col-span-2 lg:col-span-4">
        <CardHeader>
          <CardTitle>Pollution Level Distribution</CardTitle>
          <CardDescription>
            Count of samples by pollution level.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <BarChart accessibilityLayer data={chartData}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="level"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
              />
              <YAxis />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Bar dataKey="count" radius={8} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}

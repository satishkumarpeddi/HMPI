
"use client";

import { useMemo, useState, useEffect } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Cell, ResponsiveContainer } from "recharts";
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
    return "#FFFFFF";
};

export default function ResultsSummary({ data }: ResultsSummaryProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

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
    const averageHmpi = hmpis.length > 0 ? hmpis.reduce((a, b) => a + b, 0) / hmpis.length : 0;
    const minHmpi = hmpis.length > 0 ? Math.min(...hmpis) : 0;
    const maxHmpi = hmpis.length > 0 ? Math.max(...hmpis) : 0;

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
    { level: "Low", count: summary.pollutionCounts.Low },
    { level: "Medium", count: summary.pollutionCounts.Medium },
    { level: "High", count: summary.pollutionCounts.High },
  ];

  const chartConfig = {
    count: {
      label: "Samples",
    },
    hmpi: {
      label: "HMPI",
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
          <div className="h-[250px] w-full">
            {!isClient ? <Skeleton className="h-full w-full" /> : (
              <BarChart accessibilityLayer width={500} height={250} data={chartData} layout="vertical">
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
                <Bar dataKey="count" radius={8}>
                   {chartData.map((entry) => (
                      <Cell key={`cell-${entry.level}`} fill={getPollutionColor(entry.level)} />
                  ))}
                </Bar>
              </BarChart>
            )}
          </div>
        </CardContent>
      </Card>
      <Card className="md:col-span-2">
        <CardHeader>
            <CardTitle>HMPI by Location</CardTitle>
            <CardDescription>Heavy Metal Pollution Index for each sample location.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="h-[250px] w-full">
                {!isClient ? <Skeleton className="h-full w-full" /> : (
                <BarChart accessibilityLayer width={500} height={250} data={locationChartData}>
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
                )}
            </div>
        </CardContent>
      </Card>
    </div>
  );
}

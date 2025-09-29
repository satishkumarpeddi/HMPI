"use client";

import { useMemo, useState, useEffect } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Cell,
  Tooltip,
  ResponsiveContainer,
  TooltipProps,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ProcessedRow } from "@/lib/definitions";
import { Skeleton } from "@/components/ui/skeleton";
import {
  NameType,
  ValueType,
} from "recharts/types/component/DefaultTooltipContent";

interface ResultsSummaryProps {
  data: ProcessedRow[];
}

/** Returns the color based on pollution level */
const getPollutionColor = (level: string) => {
  if (level === "High") return "hsl(var(--destructive))";
  if (level === "Medium") return "hsl(var(--primary))";
  return "#22c55e"; // green-500
};

/** Custom tooltip for charts */
const CustomTooltip = ({
  active,
  payload,
  label,
}: TooltipProps<ValueType, NameType>) => {
  if (active && payload && payload.length) {
    const isLocationChart = payload[0].name === "HMPI";
    const name = isLocationChart ? label : payload[0].name;
    const value = isLocationChart
      ? payload[0].value
      : payload[1]
      ? payload[1].value
      : payload[0].value;
    const title = isLocationChart ? "HMPI" : label;

    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        <div className="flex flex-col space-y-1">
          <span className="text-muted-foreground text-sm font-bold">
            {title}
          </span>
          <div className="grid grid-cols-2 gap-x-2">
            <span className="text-muted-foreground text-sm">{name}</span>
            <span className="font-bold text-right">{value}</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export default function ResultsSummary({ data }: ResultsSummaryProps) {
  const [isClient, setIsClient] = useState(false);

  // Ensure chart only renders on client side (avoids SSR issues)
  useEffect(() => setIsClient(true), []);

  /** Compute summary metrics */
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
    const averageHmpi = hmpis.length
      ? hmpis.reduce((a, b) => a + b, 0) / hmpis.length
      : 0;
    const minHmpi = hmpis.length ? Math.min(...hmpis) : 0;
    const maxHmpi = hmpis.length ? Math.max(...hmpis) : 0;

    const pollutionCounts = data.reduce(
      (acc, row) => {
        const level = row.pollutionLevel;
        if (level === "Low" || level === "Medium" || level === "High")
          acc[level as "Low" | "Medium" | "High"] += 1;
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

  /** Data for pollution level chart */
  const chartData = [
    { level: "Low", count: summary.pollutionCounts.Low },
    { level: "Medium", count: summary.pollutionCounts.Medium },
    { level: "High", count: summary.pollutionCounts.High },
  ];

  /** Data for HMPI by location chart */
  const locationChartData = useMemo(
    () =>
      data
        .map((row) => ({
          name: row.location_name || `Sample ${row.id}`,
          hmpi: parseFloat(row.hmpi),
          level: row.pollutionLevel,
        }))
        .sort((a, b) => a.hmpi - b.hmpi),
    [data]
  );

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {/* Summary Cards */}
      {[
        { title: "Total Samples", value: summary.totalSamples },
        { title: "Average HMPI", value: summary.averageHmpi },
        { title: "Min HMPI", value: summary.minHmpi },
        { title: "Max HMPI", value: summary.maxHmpi },
      ].map((card) => (
        <Card key={card.title}>
          <CardHeader>
            <CardTitle>{card.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{card.value}</p>
          </CardContent>
        </Card>
      ))}

      {/* Pollution Level Distribution Chart */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Pollution Level Distribution</CardTitle>
          <CardDescription>
            Count of samples by pollution level.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] w-full">
            {!isClient ? (
              <Skeleton className="h-full w-full" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical">
                  <CartesianGrid horizontal={false} />
                  <YAxis
                    dataKey="level"
                    type="category"
                    axisLine={false}
                    tickLine={false}
                    tickMargin={10}
                    stroke="hsl(var(--foreground))"
                  />
                  <XAxis dataKey="count" type="number" hide />
                  <Tooltip cursor={false} content={<CustomTooltip />} />
                  <Bar dataKey="count" radius={8}>
                    {chartData.map((entry) => (
                      <Cell
                        key={`cell-${entry.level}`}
                        fill={getPollutionColor(entry.level)}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>

      {/* HMPI by Location Chart */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>HMPI by Location</CardTitle>
          <CardDescription>
            Heavy Metal Pollution Index for each sample location.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] w-full">
            {!isClient ? (
              <Skeleton className="h-full w-full" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={locationChartData}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    stroke="hsl(var(--foreground))"
                    interval={0}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    style={{ fontSize: "12px" }}
                  />
                  <YAxis dataKey="hmpi" stroke="hsl(var(--foreground))" />
                  <Tooltip cursor={false} content={<CustomTooltip />} />
                  <Bar dataKey="hmpi" name="HMPI" radius={8}>
                    {locationChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={getPollutionColor(entry.level)}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

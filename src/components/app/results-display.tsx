"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MapView from "./map-view";
import DataTable from "./data-table";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import type { ProcessedRow } from "@/lib/definitions";
import Papa from "papaparse";
import dynamic from 'next/dynamic';
import { Skeleton } from "@/components/ui/skeleton";

const ResultsSummary = dynamic(() => import('./results-summary'), {
  ssr: false,
  loading: () => (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <Skeleton className="h-28" />
      <Skeleton className="h-28" />
      <Skeleton className="h-28" />
      <Skeleton className="h-28" />
      <Skeleton className="h-80 md:col-span-2" />
      <Skeleton className="h-80 md:col-span-2" />
    </div>
  ),
});


interface ResultsDisplayProps {
  data: ProcessedRow[];
  onReset: () => void;
}

export default function ResultsDisplay({ data, onReset }: ResultsDisplayProps) {

  const handleExport = (format: "csv" | "json") => {
    let content: string;
    let mimeType: string;
    let fileExtension: string;

    if (format === "csv") {
      content = Papa.unparse(data);
      mimeType = "text/csv;charset=utf-8;";
      fileExtension = "csv";
    } else {
      content = JSON.stringify(data, null, 2);
      mimeType = "application/json;charset=utf-8;";
      fileExtension = "json";
    }

    const blob = new Blob([content], { type: mimeType });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `aquavaluate_results.${fileExtension}`;
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full">
      <Tabs defaultValue="summary" className="w-full">
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="map">Map View</TabsTrigger>
            <TabsTrigger value="table">Data Table</TabsTrigger>
          </TabsList>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => handleExport("csv")}><Download className="mr-2 h-4 w-4"/> Export CSV</Button>
            <Button variant="outline" onClick={() => handleExport("json")}><Download className="mr-2 h-4 w-4"/> Export JSON</Button>
          </div>
        </div>
        <TabsContent value="summary">
          <ResultsSummary data={data} />
        </TabsContent>
        <TabsContent value="map">
          <MapView data={data} />
        </TabsContent>
        <TabsContent value="table">
          <DataTable data={data} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

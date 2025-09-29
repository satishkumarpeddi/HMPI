"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MapView from "./map-view";
import DataTable from "./data-table";
import ResultsSummary from "./results-summary";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import type { ProcessedRow } from "@/lib/definitions";
import Papa from "papaparse";

interface ResultsDisplayProps {
  data: ProcessedRow[];
  onReset: () => void;
}

/**
 * ResultsDisplay component
 * Provides a tabbed interface to view the analysis results as a summary, map, or data table.
 * Allows exporting results as CSV or JSON.
 */
export default function ResultsDisplay({ data, onReset }: ResultsDisplayProps) {
  /** Export results to CSV or JSON */
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
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full">
      <Tabs defaultValue="summary" className="w-full">
        {/* Tabs header */}
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="map">Map View</TabsTrigger>
            <TabsTrigger value="table">Data Table</TabsTrigger>
          </TabsList>

          {/* Export buttons */}
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => handleExport("csv")}>
              <Download className="mr-2 h-4 w-4" /> Export CSV
            </Button>
            <Button variant="outline" onClick={() => handleExport("json")}>
              <Download className="mr-2 h-4 w-4" /> Export JSON
            </Button>
          </div>
        </div>

        {/* Tabs content */}
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

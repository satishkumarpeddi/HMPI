"use client";

import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ProcessedRow, StandardFields } from "@/lib/definitions";
import { Wand2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface DataTableProps {
  data: ProcessedRow[];
}

export default function DataTable({ data }: DataTableProps) {
  if (!data || data.length === 0) {
    return <p>No data to display.</p>;
  }

  // Extract column headers (exclude "_isImputed" and "id")
  const headers = Object.keys(data[0]).filter(
    (key) => !key.endsWith("_isImputed") && key !== "id"
  );

  // Ensure location column comes first
  const sortedHeaders = [
    "location_name",
    ...headers.filter((h) => h !== "location_name"),
  ];

  // Map headers to user-friendly display names
  const displayHeaders = sortedHeaders.map((h) => {
    if (StandardFields[h as keyof typeof StandardFields]) {
      return StandardFields[h as keyof typeof StandardFields];
    }
    if (h === "hmpi") return "HMPI";
    if (h === "pollutionLevel") return "Pollution Level";
    return h;
  });

  /** Assign color classes based on pollution level */
  const getPollutionLevelClass = (level: string) => {
    switch (level) {
      case "High":
        return "bg-red-500/20 text-red-400";
      case "Medium":
        return "bg-orange-500/20 text-orange-400";
      case "Low":
        return "bg-green-500/20 text-green-400";
      default:
        return "";
    }
  };

  return (
    <Card>
      <ScrollArea className="h-[600px]">
        <Table>
          <TableHeader>
            <TableRow>
              {displayHeaders.map((header) => (
                <TableHead key={header}>{header}</TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody>
            <TooltipProvider>
              {data.map((row) => (
                <TableRow key={row.id}>
                  {sortedHeaders.map((header) => {
                    const cellValue = row[header];
                    const isImputed = row[`${header}_isImputed`];

                    // Apply special styling for pollution level column
                    const isPollutionColumn = header === "pollutionLevel";
                    const pollutionClass = isPollutionColumn
                      ? getPollutionLevelClass(cellValue)
                      : "";

                    return (
                      <TableCell key={header}>
                        <span
                          className={cn(
                            isPollutionColumn &&
                              "px-2 py-1 rounded-md font-medium",
                            pollutionClass
                          )}
                        >
                          {isImputed ? (
                            <Tooltip>
                              <TooltipTrigger>
                                <span
                                  className={cn(
                                    "flex items-center gap-1.5",
                                    isPollutionColumn
                                      ? "text-inherit"
                                      : "text-accent bg-accent/20 px-2 py-1 rounded-md"
                                  )}
                                >
                                  <Wand2 className="h-3 w-3" /> {cellValue}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Value imputed by AI</p>
                              </TooltipContent>
                            </Tooltip>
                          ) : (
                            <span>{cellValue}</span>
                          )}
                        </span>
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TooltipProvider>
          </TableBody>
        </Table>
      </ScrollArea>
    </Card>
  );
}

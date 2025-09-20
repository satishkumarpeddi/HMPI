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

interface DataTableProps {
  data: ProcessedRow[];
}

export default function DataTable({ data }: DataTableProps) {
  if (!data || data.length === 0) {
    return <p>No data to display.</p>;
  }

  const headers = Object.keys(data[0]).filter(
    (key) => !key.endsWith("_isImputed") && key !== "id"
  );
  
  const displayHeaders = headers.map(h => {
      if(StandardFields[h as keyof typeof StandardFields]) return StandardFields[h as keyof typeof StandardFields];
      if(h === 'hmpi') return 'HMPI';
      if(h === 'pollutionLevel') return 'Pollution Level';
      return h;
  });

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
                  {headers.map((header) => {
                    const isImputed = row[`${header}_isImputed`];
                    const cellValue = row[header];

                    return (
                      <TableCell key={header}>
                        {isImputed ? (
                          <Tooltip>
                            <TooltipTrigger>
                              <span className="flex items-center gap-1.5 text-accent bg-accent/20 px-2 py-1 rounded-md">
                                <Wand2 className="h-3 w-3"/> {cellValue}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Value imputed by AI</p>
                            </TooltipContent>
                          </Tooltip>
                        ) : (
                          <span>{cellValue}</span>
                        )}
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

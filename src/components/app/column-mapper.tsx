"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import type { CsvHeader, ColumnMapping, StandardField } from "@/lib/definitions";
import { StandardFields } from "@/lib/definitions";
import { Wand2, Loader2 } from "lucide-react";

interface ColumnMapperProps {
  headers: CsvHeader;
  onProcess: (mapping: ColumnMapping, useAi: boolean) => void;
  onCancel: () => void;
  suggestedMapping: ColumnMapping | null;
  isLoading: boolean;
}

export default function ColumnMapper({ headers, onProcess, onCancel, suggestedMapping, isLoading }: ColumnMapperProps) {
  const [mapping, setMapping] = useState<ColumnMapping>({});
  const [useAi, setUseAi] = useState(false);

  useEffect(() => {
    if (suggestedMapping) {
      setMapping(suggestedMapping);
    }
  }, [suggestedMapping]);

  const handleMappingChange = (field: StandardField, value: string) => {
    // Treat the placeholder value as an empty selection
    const finalValue = value === "__placeholder__" ? "" : value;
    setMapping((prev) => ({ ...prev, [field]: finalValue }));
  };
  
  const isProcessable = mapping.latitude && mapping.longitude;

  return (
    <Card className="w-full max-w-3xl">
      <CardHeader>
        <CardTitle>Map Your Data Columns</CardTitle>
        <CardDescription>
          Match the columns from your CSV file to the required fields for analysis.
          Latitude and Longitude are required for map visualization. We've suggested mappings using AI.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative">
        {isLoading && (
            <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex flex-col items-center justify-center z-10 rounded-lg">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="mt-2 text-muted-foreground">Suggesting mappings...</p>
            </div>
        )}
        {(Object.keys(StandardFields) as StandardField[]).map((field) => (
          <div key={field} className="space-y-2">
            <Label htmlFor={`select-${field}`}>
                {StandardFields[field]}
                {(field === 'latitude' || field === 'longitude') && <span className="text-destructive">*</span>}
            </Label>
            <Select 
              value={mapping[field] || "__placeholder__"}
              onValueChange={(value) => handleMappingChange(field, value)}
            >
              <SelectTrigger id={`select-${field}`}>
                <SelectValue placeholder="Select CSV column..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__placeholder__" disabled>Select CSV column...</SelectItem>
                {headers.map((header) => (
                  <SelectItem key={header} value={header}>
                    {header}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ))}
        <div className="sm:col-span-2 flex items-center justify-between p-4 rounded-lg bg-secondary/50 mt-4">
          <div className="flex items-center gap-3">
            <Wand2 className="h-6 w-6 text-primary"/>
            <div>
              <Label htmlFor="ai-switch" className="font-bold">AI Missing Value Imputation</Label>
              <p className="text-sm text-muted-foreground">
                Use AI to fill in missing data points.
              </p>
            </div>
          </div>
          <Switch id="ai-switch" checked={useAi} onCheckedChange={setUseAi} />
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={() => onProcess(mapping, useAi)} disabled={!isProcessable || isLoading}>
          Analyze Data
        </Button>
      </CardFooter>
    </Card>
  );
}

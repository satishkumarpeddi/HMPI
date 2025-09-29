"use client";

import { useState } from "react";
import { CsvHeader } from "@/lib/definitions";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ManualMapperProps {
  headers: CsvHeader;
  onSubmit: (mapping: { latitude: string; longitude: string }) => void;
}

/**
 * ManualMapper component
 * Allows the user to manually map latitude and longitude columns
 * when automatic detection fails.
 */
export default function ManualMapper({ headers, onSubmit }: ManualMapperProps) {
  const [latitude, setLatitude] = useState<string>("");
  const [longitude, setLongitude] = useState<string>("");

  /** Submit the selected mapping */
  const handleSubmit = () => {
    if (latitude && longitude) {
      onSubmit({ latitude, longitude });
    }
  };

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle>Manual Mapping Required</CardTitle>
        <CardDescription>
          We couldn't automatically detect the latitude and longitude columns.
          Please map them below to continue.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Instructional alert */}
        <Alert
          variant="default"
          className="bg-primary/10 border-primary/50 text-primary-foreground"
        >
          <AlertCircle className="h-4 w-4 !text-primary" />
          <AlertTitle className="text-primary font-semibold">
            Heads up!
          </AlertTitle>
          <AlertDescription className="text-primary/90">
            For best results, ensure your CSV headers are clearly named (e.g.,
            "Latitude", "Longitude", "Lat", "Lon").
          </AlertDescription>
        </Alert>

        {/* Column selectors */}
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <Label htmlFor="latitude-select">Latitude Column</Label>
            <Select onValueChange={setLatitude} value={latitude}>
              <SelectTrigger id="latitude-select">
                <SelectValue placeholder="Select latitude column..." />
              </SelectTrigger>
              <SelectContent>
                {headers.map((header) => (
                  <SelectItem key={header} value={header}>
                    {header}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="longitude-select">Longitude Column</Label>
            <Select onValueChange={setLongitude} value={longitude}>
              <SelectTrigger id="longitude-select">
                <SelectValue placeholder="Select longitude column..." />
              </SelectTrigger>
              <SelectContent>
                {headers.map((header) => (
                  <SelectItem key={header} value={header}>
                    {header}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>

      <CardFooter>
        <Button onClick={handleSubmit} disabled={!latitude || !longitude}>
          Proceed with Analysis
        </Button>
      </CardFooter>
    </Card>
  );
}

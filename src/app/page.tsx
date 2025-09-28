"use client";

import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import CsvUploader from "@/components/app/csv-uploader";
import ResultsDisplay from "@/components/app/results-display";
import { Logo } from "@/components/app/logo";
import { Button } from "@/components/ui/button";
import { processDataWithAI, processDataWithoutAI, getSuggestedMapping } from "@/app/actions";
import type {
  CsvData,
  CsvHeader,
  ColumnMapping,
  ProcessedRow,
} from "@/lib/definitions";
import { Loader2, Wand2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

type Step = "upload" | "results";

export default function Home() {
  const [step, setStep] = useState<Step>("upload");
  const [processedData, setProcessedData] = useState<ProcessedRow[] | null>(
    null
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [useAiImputation, setUseAiImputation] = useState(false);
  const { toast } = useToast();

  const handleUpload = async (data: CsvData, headers: CsvHeader) => {
    setIsProcessing(true);
    setStep("results");
    
    try {
      const suggestedMapping = await getSuggestedMapping(headers);

      if (!suggestedMapping.latitude || !suggestedMapping.longitude) {
        throw new Error("Could not automatically determine Latitude and Longitude columns. Please ensure your CSV has clear headers like 'latitude' and 'longitude'.");
      }

      let result;
      if (useAiImputation) {
        result = await processDataWithAI(data, suggestedMapping);
      } else {
        result = await processDataWithoutAI(data, suggestedMapping);
      }

      if (result.error) {
        throw new Error(result.error);
      }
      
      setProcessedData(result.data || []);
    } catch (error) {
      console.error("Processing failed:", error);
      toast({
        variant: "destructive",
        title: "Processing Failed",
        description:
          error instanceof Error
            ? error.message
            : "An unknown error occurred.",
      });
      handleReset(); // Go back to upload screen on error
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setStep("upload");
    setProcessedData(null);
    setIsProcessing(false);
  };

  const renderStep = () => {
    switch (step) {
      case "upload":
        return (
          <div className="text-center">
            <h2 className="text-4xl font-headline font-bold tracking-tight sm:text-5xl md:text-6xl">
              Analyze Groundwater Pollution Instantly
            </h2>
            <p className="mt-4 text-lg text-muted-foreground md:text-xl">
              Upload your CSV data to calculate Heavy Metal Pollution Indices
              (HMPI) and visualize contamination risks on an interactive map.
            </p>
            <Card className="mt-12 max-w-2xl mx-auto bg-card/50 backdrop-blur-sm">
              <CardContent className="p-6 space-y-6">
                <CsvUploader onUpload={handleUpload} disabled={isProcessing} />
                <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                  <div className="flex items-center gap-3 text-left">
                    <Wand2 className="h-6 w-6 text-primary"/>
                    <div>
                      <Label htmlFor="ai-switch" className="font-bold">AI Missing Value Imputation</Label>
                      <p className="text-sm text-muted-foreground">
                        Use AI to fill in missing data points for more accurate analysis.
                      </p>
                    </div>
                  </div>
                  <Switch id="ai-switch" checked={useAiImputation} onCheckedChange={setUseAiImputation} />
                </div>
              </CardContent>
            </Card>
          </div>
        );
      case "results":
        if (isProcessing) {
          return (
            <div className="flex flex-col items-center justify-center gap-4 text-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <h2 className="text-2xl font-bold">Analyzing Data...</h2>
              <p className="text-muted-foreground">
                Our AI is mapping columns and processing your file. This may take a moment.
              </p>
            </div>
          );
        }
        return (
          processedData && (
            <ResultsDisplay
              data={processedData}
              onReset={handleReset}
            />
          )
        );
      default:
        return null;
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-4 sm:p-8 md:p-12">
      <header className="w-full max-w-7xl mx-auto flex justify-between items-center mb-12">
        <Logo />
        {step !== 'upload' && !isProcessing && (
          <Button variant="ghost" onClick={handleReset}>Start Over</Button>
        )}
      </header>
      <div className="w-full max-w-7xl flex-1 flex flex-col items-center justify-center">
        {renderStep()}
      </div>
    </main>
  );
}

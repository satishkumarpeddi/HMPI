"use client";

import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import CsvUploader from "@/components/app/csv-uploader";
import ColumnMapper from "@/components/app/column-mapper";
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
import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

type Step = "upload" | "mapColumns" | "results";

export default function Home() {
  const [step, setStep] = useState<Step>("upload");
  const [csvData, setCsvData] = useState<CsvData | null>(null);
  const [csvHeaders, setCsvHeaders] = useState<CsvHeader | null>(null);
  const [suggestedMapping, setSuggestedMapping] = useState<ColumnMapping | null>(null);
  const [processedData, setProcessedData] = useState<ProcessedRow[] | null>(
    null
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingMapping, setIsLoadingMapping] = useState(false);
  const { toast } = useToast();

  const handleUpload = async (data: CsvData, headers: CsvHeader) => {
    setIsLoadingMapping(true);
    setCsvData(data);
    setCsvHeaders(headers);
    setStep("mapColumns");

    try {
      const mapping = await getSuggestedMapping(headers);
      setSuggestedMapping(mapping);
    } catch (error) {
       toast({
        variant: "destructive",
        title: "AI Mapping Failed",
        description: "Could not automatically suggest column mappings. Please map them manually.",
      });
      setSuggestedMapping({}); // Set to empty to allow manual mapping
    } finally {
      setIsLoadingMapping(false);
    }
  };

  const handleProcess = async (mapping: ColumnMapping, useAi: boolean) => {
    if (!csvData) return;
    setIsProcessing(true);
    setStep("results");

    try {
      let result;
      if (useAi) {
        result = await processDataWithAI(csvData, mapping);
      } else {
        result = await processDataWithoutAI(csvData, mapping);
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
      handleReset();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setStep("upload");
    setCsvData(null);
    setCsvHeaders(null);
    setProcessedData(null);
    setSuggestedMapping(null);
    setIsProcessing(false);
    setIsLoadingMapping(false);
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
              <CardContent className="p-6">
                <CsvUploader onUpload={handleUpload} />
              </CardContent>
            </Card>
          </div>
        );
      case "mapColumns":
        return csvHeaders && (
          <ColumnMapper 
            headers={csvHeaders} 
            onProcess={handleProcess} 
            onCancel={handleReset}
            suggestedMapping={suggestedMapping}
            isLoading={isLoadingMapping}
          />
        );
      case "results":
        if (isProcessing) {
          return (
            <div className="flex flex-col items-center justify-center gap-4 text-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <h2 className="text-2xl font-bold">Processing Data...</h2>
              <p className="text-muted-foreground">
                This may take a moment, especially with AI imputation.
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

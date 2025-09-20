"use client";

import { useState, useCallback, ChangeEvent, DragEvent } from "react";
import Papa from "papaparse";
import { UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import type { CsvData, CsvHeader } from "@/lib/definitions";

interface CsvUploaderProps {
  onUpload: (data: CsvData, headers: CsvHeader) => void;
}

export default function CsvUploader({ onUpload }: CsvUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFile = (file: File) => {
    if (file && file.type === "text/csv") {
      setFileName(file.name);
      Papa.parse(file, {
        complete: (results) => {
          const headers = results.data[0] as CsvHeader;
          const data = results.data as CsvData;
          onUpload(data, headers);
        },
        error: (error) => {
          toast({
            variant: "destructive",
            title: "CSV Parsing Error",
            description: error.message,
          });
          setFileName(null);
        },
        skipEmptyLines: true,
      });
    } else {
      toast({
        variant: "destructive",
        title: "Invalid File",
        description: "Please upload a valid CSV file.",
      });
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  const handleDragEnter = useCallback((e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent<HTMLLabelElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleFile(e.dataTransfer.files[0]);
      }
    },
    [handleFile]
  );

  return (
    <div className="flex flex-col items-center gap-4">
      <label
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`w-full flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
          isDragging ? "border-primary bg-primary/10" : "border-border"
        }`}
      >
        <UploadCloud className="h-12 w-12 text-muted-foreground" />
        <p className="mt-4 text-center text-muted-foreground">
          <span className="font-semibold text-accent">Drag & drop</span> your
          CSV file here, or click to select a file.
        </p>
        <input
          id="csv-upload"
          type="file"
          accept=".csv"
          className="hidden"
          onChange={handleFileChange}
        />
      </label>
      {fileName && <p className="text-sm text-muted-foreground">File: {fileName}</p>}
      <Button onClick={() => document.getElementById('csv-upload')?.click()} variant="outline">
        Select File
      </Button>
    </div>
  );
}

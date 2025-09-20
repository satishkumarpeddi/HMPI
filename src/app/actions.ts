"use server";

import { imputeMissingHeavyMetalValues } from "@/ai/flows/impute-missing-heavy-metal-values";
import {
  arrayToCsv,
  parseImputedCsv,
  processRawData,
  reprocessParsedData,
} from "@/lib/data-processing";
import {
  ColumnMapping,
  CsvData,
  ProcessedRow,
} from "@/lib/definitions";

type ProcessingResult = {
  data?: ProcessedRow[];
  error?: string;
};

export async function processDataWithAI(
  data: CsvData,
  mapping: ColumnMapping
): Promise<ProcessingResult> {
  try {
    const csvString = arrayToCsv(data);
    const result = await imputeMissingHeavyMetalValues({ data: csvString });
    if (!result.imputedData) {
      throw new Error("AI imputation failed to return data.");
    }

    const parsedData = parseImputedCsv(result.imputedData);
    
    // Remap data based on user's column selection
    const rawHeaders = data[0] as string[];
    const mappedData = parsedData.map(row => {
        const newRow: ProcessedRow = { id: row.id };
        Object.entries(mapping).forEach(([standardField, csvHeader]) => {
            if (csvHeader) {
                newRow[standardField as keyof ColumnMapping] = row[csvHeader];
                if (row[`${csvHeader}_isImputed`]) {
                    newRow[`${standardField}_isImputed`] = true;
                }
            }
        });
        return newRow;
    });

    const finalData = reprocessParsedData(mappedData);

    return { data: finalData };
  } catch (error) {
    console.error("Error in processDataWithAI:", error);
    return {
      error:
        error instanceof Error ? error.message : "An unknown error occurred during AI processing.",
    };
  }
}

export async function processDataWithoutAI(
  data: CsvData,
  mapping: ColumnMapping
): Promise<ProcessingResult> {
  try {
    const processed = processRawData(data, mapping);
    return { data: processed };
  } catch (error) {
    console.error("Error in processDataWithoutAI:", error);
    return {
      error:
        error instanceof Error ? error.message : "An unknown error occurred during data processing.",
    };
  }
}

"use server";

import { imputeMissingHeavyMetalValues } from "@/ai/flows/impute-missing-heavy-metal-values";
import { suggestColumnMapping } from "@/ai/flows/suggest-column-mapping";
import {
  arrayToCsv,
  parseImputedCsv,
  processRawData,
  reprocessParsedData,
} from "@/lib/data-processing";
import {
  ColumnMapping,
  CsvData,
  CsvHeader,
  ProcessedRow,
} from "@/lib/definitions";

// Result type for processing functions
type ProcessingResult = {
  data?: ProcessedRow[];
  error?: string;
};

/**
 * Process CSV data using AI for missing value imputation.
 */
export async function processDataWithAI(
  data: CsvData,
  mapping: ColumnMapping
): Promise<ProcessingResult> {
  try {
    // Convert raw array data to CSV string
    const csvString = arrayToCsv(data);

    // Impute missing values using AI
    const result = await imputeMissingHeavyMetalValues({ data: csvString });
    if (!result.imputedData) {
      throw new Error("AI imputation failed to return data.");
    }

    // Parse the imputed CSV back into structured data
    const parsedData = parseImputedCsv(result.imputedData);

    // Remap parsed data based on user's column mapping
    const mappedData = parsedData.map((row) => {
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

    // Final processing for cleaned and normalized data
    const finalData = reprocessParsedData(mappedData);

    return { data: finalData };
  } catch (error) {
    console.error("Error in processDataWithAI:", error);
    return {
      error:
        error instanceof Error
          ? error.message
          : "An unknown error occurred during AI processing.",
    };
  }
}

/**
 * Process CSV data without AI (manual mapping only).
 */
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
        error instanceof Error
          ? error.message
          : "An unknown error occurred during data processing.",
    };
  }
}

/**
 * Get AI-suggested column mapping from CSV headers.
 */
export async function getSuggestedMapping(
  headers: CsvHeader
): Promise<ColumnMapping> {
  try {
    const result = await suggestColumnMapping({ headers });
    return result;
  } catch (error) {
    console.error("Error suggesting column mapping:", error);
    // Return empty mapping on error; user will need to map manually
    return {};
  }
}

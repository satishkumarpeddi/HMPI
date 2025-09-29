"use server";

/**
 * AI agent for imputing missing heavy metal concentration values in groundwater data.
 */

import { ai } from "@/ai/genkit";
import { z } from "genkit";

// Input schema for imputation
const ImputeMissingHeavyMetalValuesInputSchema = z.object({
  data: z
    .string()
    .describe(
      "CSV string of groundwater heavy metal concentration data including location, depth, neighboring sample values, and heavy metal concentrations. Missing values are empty strings."
    ),
  locationContext: z
    .string()
    .optional()
    .describe(
      "Optional additional information about the groundwater sample locations to aid imputation."
    ),
});
export type ImputeMissingHeavyMetalValuesInput = z.infer<
  typeof ImputeMissingHeavyMetalValuesInputSchema
>;

// Output schema for imputation
const ImputeMissingHeavyMetalValuesOutputSchema = z.object({
  imputedData: z
    .string()
    .describe(
      "CSV string with imputed groundwater heavy metal concentration data. Includes an audit trail marking all AI-imputed values."
    ),
});
export type ImputeMissingHeavyMetalValuesOutput = z.infer<
  typeof ImputeMissingHeavyMetalValuesOutputSchema
>;

// Main function to impute missing values
export async function imputeMissingHeavyMetalValues(
  input: ImputeMissingHeavyMetalValuesInput
): Promise<ImputeMissingHeavyMetalValuesOutput> {
  return imputeMissingHeavyMetalValuesFlow(input);
}

// Prompt definition for AI model
const imputeMissingHeavyMetalValuesPrompt = ai.definePrompt({
  name: "imputeMissingHeavyMetalValuesPrompt",
  input: { schema: ImputeMissingHeavyMetalValuesInputSchema },
  output: { schema: ImputeMissingHeavyMetalValuesOutputSchema },
  prompt: `You are an expert in groundwater heavy metal concentration data analysis tasked with imputing missing values.

Instructions:
1. Receive a CSV string of groundwater heavy metal concentration data. Missing values are empty strings.
2. Analyze location, depth, and neighboring sample values to impute reasonable values.
3. Generate an audit trail marking all AI-imputed values.
4. Return a CSV string with the imputed data.

Location context: {{{locationContext}}}

Data:
{{{data}}}
`,
});

// Flow definition for executing the AI prompt
const imputeMissingHeavyMetalValuesFlow = ai.defineFlow(
  {
    name: "imputeMissingHeavyMetalValuesFlow",
    inputSchema: ImputeMissingHeavyMetalValuesInputSchema,
    outputSchema: ImputeMissingHeavyMetalValuesOutputSchema,
  },
  async (input) => {
    const { output } = await imputeMissingHeavyMetalValuesPrompt(input);
    return output!;
  }
);

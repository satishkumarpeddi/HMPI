"use server";

/**
 * AI agent for suggesting column mappings from CSV headers.
 */

import { ai } from "@/ai/genkit";
import { z } from "genkit";
import { StandardFields, StandardField } from "@/lib/definitions";

// Input schema
const SuggestColumnMappingInputSchema = z.object({
  headers: z
    .array(z.string())
    .describe("Array of header strings from the uploaded CSV file."),
});
export type SuggestColumnMappingInput = z.infer<
  typeof SuggestColumnMappingInputSchema
>;

// Dynamically create output schema from StandardFields
const outputSchemaShape = (
  Object.keys(StandardFields) as StandardField[]
).reduce((acc, key) => {
  acc[key] = z
    .string()
    .optional()
    .describe(
      `CSV header that maps to the '${StandardFields[key]}' standard field.`
    );
  return acc;
}, {} as Record<StandardField, z.ZodOptional<z.ZodString>>);

const SuggestColumnMappingOutputSchema = z.object(outputSchemaShape);
export type SuggestColumnMappingOutput = z.infer<
  typeof SuggestColumnMappingOutputSchema
>;

// Main function
export async function suggestColumnMapping(
  input: SuggestColumnMappingInput
): Promise<SuggestColumnMappingOutput> {
  return suggestColumnMappingFlow(input);
}

// AI prompt definition
const suggestColumnMappingPrompt = ai.definePrompt({
  name: "suggestColumnMappingPrompt",
  input: { schema: SuggestColumnMappingInputSchema },
  output: { schema: SuggestColumnMappingOutputSchema },
  prompt: `You are an expert data analyst in environmental data. Map CSV headers to the predefined standard fields.

Instructions:
1. Receive a list of CSV headers.
2. Match each header to one of the standard fields: ${JSON.stringify(
    StandardFields,
    null,
    2
  )}.
3. Consider common abbreviations and variations (e.g., 'lat' → 'latitude', 'As' → 'Arsenic').
4. Return a JSON object where keys are standard field names and values are the corresponding headers.
5. Omit any field without a confident match.

CSV headers:
{{{headers}}}
`,
});

// Flow definition
const suggestColumnMappingFlow = ai.defineFlow(
  {
    name: "suggestColumnMappingFlow",
    inputSchema: SuggestColumnMappingInputSchema,
    outputSchema: SuggestColumnMappingOutputSchema,
  },
  async (input) => {
    const { output } = await suggestColumnMappingPrompt(input);
    return output!;
  }
);

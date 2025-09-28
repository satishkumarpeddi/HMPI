'use server';
/**
 * @fileOverview An AI agent for suggesting column mappings from CSV headers.
 *
 * - suggestColumnMapping - A function that suggests mappings between CSV headers and standard fields.
 * - SuggestColumnMappingInput - The input type for the suggestColumnMapping function.
 * - SuggestColumnMappingOutput - The return type for the suggestColumnMapping function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { StandardFields, StandardField } from '@/lib/definitions';

const SuggestColumnMappingInputSchema = z.object({
  headers: z.array(z.string()).describe('An array of header strings from the uploaded CSV file.'),
});
export type SuggestColumnMappingInput = z.infer<typeof SuggestColumnMappingInputSchema>;

// Dynamically create the output schema from StandardFields
const outputSchemaShape = (Object.keys(StandardFields) as StandardField[]).reduce((acc, key) => {
    acc[key] = z.string().optional().describe(`The header from the CSV that maps to the '${StandardFields[key]}' field.`);
    return acc;
}, {} as Record<StandardField, z.ZodOptional<z.ZodString>>);

const SuggestColumnMappingOutputSchema = z.object(outputSchemaShape);
export type SuggestColumnMappingOutput = z.infer<typeof SuggestColumnMappingOutputSchema>;

export async function suggestColumnMapping(
  input: SuggestColumnMappingInput
): Promise<SuggestColumnMappingOutput> {
  return suggestColumnMappingFlow(input);
}

const suggestColumnMappingPrompt = ai.definePrompt({
  name: 'suggestColumnMappingPrompt',
  input: {schema: SuggestColumnMappingInputSchema},
  output: {schema: SuggestColumnMappingOutputSchema},
  prompt: `You are an expert data analyst specializing in environmental data. Your task is to map CSV headers to a predefined set of standard fields.

  Instructions:
  1.  You will receive a list of headers from a CSV file.
  2.  Your goal is to find the best match for each of the following standard fields: ${JSON.stringify(StandardFields, null, 2)}.
  3.  Analyze the header names, considering common abbreviations and variations (e.g., 'lat' for 'latitude', 'long' for 'longitude', 'As' for 'Arsenic').
  4.  Return a JSON object where the keys are the standard field names and the values are the corresponding header names from the input list.
  5.  If you cannot find a confident match for a particular standard field, omit it from the output.

  Here are the CSV headers:
  {{{headers}}}
  `,
});

const suggestColumnMappingFlow = ai.defineFlow(
  {
    name: 'suggestColumnMappingFlow',
    inputSchema: SuggestColumnMappingInputSchema,
    outputSchema: SuggestColumnMappingOutputSchema,
  },
  async input => {
    const {output} = await suggestColumnMappingPrompt(input);
    return output!;
  }
);

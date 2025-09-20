'use server';
/**
 * @fileOverview An AI agent for imputing missing heavy metal concentration values in groundwater data.
 *
 * - imputeMissingHeavyMetalValues - A function that imputes missing values in heavy metal concentration data.
 * - ImputeMissingHeavyMetalValuesInput - The input type for the imputeMissingHeavyMetalValues function.
 * - ImputeMissingHeavyMetalValuesOutput - The return type for the imputeMissingHeavyMetalValues function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ImputeMissingHeavyMetalValuesInputSchema = z.object({
  data: z
    .string()
    .describe(
      'A CSV string containing groundwater heavy metal concentration data. The data should include location, depth, neighboring sample values, and heavy metal concentrations, with missing values represented as empty strings.'
    ),
  locationContext: z
    .string()
    .optional()
    .describe(
      'Additional information about the location of the groundwater samples, which may help in the imputation process. This is optional and can provide useful context to the AI model.'
    ),
});
export type ImputeMissingHeavyMetalValuesInput = z.infer<
  typeof ImputeMissingHeavyMetalValuesInputSchema
>;

const ImputeMissingHeavyMetalValuesOutputSchema = z.object({
  imputedData: z
    .string()
    .describe(
      'A CSV string containing the imputed groundwater heavy metal concentration data. The missing values have been replaced with AI-imputed values. An audit trail is included, clearly marking all imputed values.'
    ),
});
export type ImputeMissingHeavyMetalValuesOutput = z.infer<
  typeof ImputeMissingHeavyMetalValuesOutputSchema
>;

export async function imputeMissingHeavyMetalValues(
  input: ImputeMissingHeavyMetalValuesInput
): Promise<ImputeMissingHeavyMetalValuesOutput> {
  return imputeMissingHeavyMetalValuesFlow(input);
}

const imputeMissingHeavyMetalValuesPrompt = ai.definePrompt({
  name: 'imputeMissingHeavyMetalValuesPrompt',
  input: {schema: ImputeMissingHeavyMetalValuesInputSchema},
  output: {schema: ImputeMissingHeavyMetalValuesOutputSchema},
  prompt: `You are an expert in groundwater heavy metal concentration data analysis. You are tasked with imputing missing values in a dataset.

  Instructions:
  1.  Receive a CSV string containing groundwater heavy metal concentration data. The data includes location, depth, neighboring sample values, and heavy metal concentrations. Missing values are represented as empty strings.
  2.  Analyze the data, considering the location, depth, and neighboring sample values to impute reasonable values for the missing data.
  3.  Generate an audit trail that clearly indicates which values have been imputed by the AI.
  4.  Return a CSV string containing the imputed groundwater heavy metal concentration data. The missing values have been replaced with AI-imputed values. An audit trail is included, clearly marking all imputed values.

  The location context is: {{{locationContext}}}

  Here is the data:
  {{{data}}}
  `,
});

const imputeMissingHeavyMetalValuesFlow = ai.defineFlow(
  {
    name: 'imputeMissingHeavyMetalValuesFlow',
    inputSchema: ImputeMissingHeavyMetalValuesInputSchema,
    outputSchema: ImputeMissingHeavyMetalValuesOutputSchema,
  },
  async input => {
    const {output} = await imputeMissingHeavyMetalValuesPrompt(input);
    return output!;
  }
);

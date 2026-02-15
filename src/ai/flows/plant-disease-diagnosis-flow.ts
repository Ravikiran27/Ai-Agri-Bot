'use server';
/**
 * @fileOverview An AI agent for diagnosing plant diseases from images.
 *
 * - plantDiseaseDiagnosis - A function that handles the plant disease diagnosis process.
 * - PlantDiseaseDiagnosisInput - The input type for the plantDiseaseDiagnosis function.
 * - PlantDiseaseDiagnosisOutput - The return type for the plantDiseaseDiagnosis function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PlantDiseaseDiagnosisInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a plant showing signs of disease, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  description: z
    .string()
    .optional()
    .describe('An optional textual description of the plant symptoms or context.'),
});
export type PlantDiseaseDiagnosisInput = z.infer<
  typeof PlantDiseaseDiagnosisInputSchema
>;

const PlantDiseaseDiagnosisOutputSchema = z.object({
  diseaseIdentification: z.object({
    isDiseased: z.boolean().describe('Whether a disease was identified in the plant.').default(false),
    diseaseName: z.string().describe('The name of the identified disease. Empty if no disease found.').default(''),
    confidence: z
      .number()
      .min(0)
      .max(1)
      .describe(
        'A confidence score (0-1) in the disease identification. 0 for no disease, 1 for high confidence.'
      ).default(0),
    description: z.string().describe('A brief description of the identified disease. Empty if no disease found.').default(''),
  }),
  treatmentSuggestions: z
    .array(z.string())
    .describe('A list of suggested treatments for the identified disease. Empty if no disease found.').default([]),
  preventativeMeasures: z
    .array(z.string())
    .describe('A list of preventative measures to avoid future outbreaks. Empty if no disease found.').default([]),
});
export type PlantDiseaseDiagnosisOutput = z.infer<
  typeof PlantDiseaseDiagnosisOutputSchema
>;

export async function plantDiseaseDiagnosis(
  input: PlantDiseaseDiagnosisInput
): Promise<PlantDiseaseDiagnosisOutput> {
  return plantDiseaseDiagnosisFlow(input);
}

const plantDiseaseDiagnosisPrompt = ai.definePrompt({
  name: 'plantDiseaseDiagnosisPrompt',
  input: {schema: PlantDiseaseDiagnosisInputSchema},
  output: {schema: PlantDiseaseDiagnosisOutputSchema},
  prompt: `You are an expert plant pathologist and botanist specialized in identifying plant diseases and providing actionable advice.

Your task is to analyze the provided image of a plant and an optional description to diagnose any present diseases. If no disease is identified, clearly state that the plant appears healthy.

Based on your analysis, provide:
1.  Whether the plant is diseased.
2.  The specific name of the disease (if any).
3.  Your confidence level in the diagnosis (between 0 and 1).
4.  A brief description of the disease.
5.  A list of practical treatment suggestions.
6.  A list of preventative measures to avoid future occurrences.

Ensure your response is formatted as a JSON object strictly adhering to the provided output schema. If the plant is healthy, set 'isDiseased' to false and provide empty strings/arrays for other disease-related fields.

Description: {{{description}}}
Photo: {{media url=photoDataUri}}`,
});

const plantDiseaseDiagnosisFlow = ai.defineFlow(
  {
    name: 'plantDiseaseDiagnosisFlow',
    inputSchema: PlantDiseaseDiagnosisInputSchema,
    outputSchema: PlantDiseaseDiagnosisOutputSchema,
  },
  async input => {
    const {output} = await plantDiseaseDiagnosisPrompt(input);
    return output!;
  }
);

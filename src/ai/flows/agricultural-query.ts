'use server';
/**
 * @fileOverview An AI agent for answering general agricultural queries.
 *
 * - agriculturalQuery - A function that handles agricultural queries.
 * - AgriculturalQueryInput - The input type for the agriculturalQuery function.
 * - AgriculturalQueryOutput - The return type for the agriculturalQuery function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AgriculturalQueryInputSchema = z.object({
  query: z.string().describe('The farmer\'s agricultural query.'),
});
export type AgriculturalQueryInput = z.infer<typeof AgriculturalQueryInputSchema>;

const AgriculturalQueryOutputSchema = z.object({
  answer: z.string().describe('The answer to the agricultural query.'),
});
export type AgriculturalQueryOutput = z.infer<typeof AgriculturalQueryOutputSchema>;

export async function agriculturalQuery(input: AgriculturalQueryInput): Promise<AgriculturalQueryOutput> {
  return agriculturalQueryFlow(input);
}

const agriculturalQueryPrompt = ai.definePrompt({
  name: 'agriculturalQueryPrompt',
  input: {schema: AgriculturalQueryInputSchema},
  output: {schema: AgriculturalQueryOutputSchema},
  prompt: `You are AgriBot, an expert agricultural assistant designed to provide accurate, reliable, and relevant information to farmers.
Your role is to answer questions about general agricultural practices, pest control, specific plant care, soil health, and other farming-related topics.
Provide a clear, concise, and helpful answer based on the following query:

Query: {{{query}}}`,
});

const agriculturalQueryFlow = ai.defineFlow(
  {
    name: 'agriculturalQueryFlow',
    inputSchema: AgriculturalQueryInputSchema,
    outputSchema: AgriculturalQueryOutputSchema,
  },
  async (input) => {
    const {output} = await agriculturalQueryPrompt(input);
    return output!;
  }
);

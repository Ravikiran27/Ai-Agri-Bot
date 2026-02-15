'use server';
/**
 * @fileOverview A crop recommendation AI agent.
 *
 * - recommendCrop - A function that handles the crop recommendation process.
 * - CropRecommendationInput - The input type for the recommendCrop function.
 * - CropRecommendationOutput - The return type for the recommendCrop function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CropRecommendationInputSchema = z.object({
  soilpH: z.number().min(0).max(14).describe('The pH level of the soil (0-14).'),
  nitrogenLevel: z.number().min(0).describe('The nitrogen level in the soil (ppm).'),
  phosphorusLevel: z.number().min(0).describe('The phosphorus level in the soil (ppm).'),
  potassiumLevel: z.number().min(0).describe('The potassium level in the soil (ppm).'),
  farmingGoals: z.string().describe('The farmer\'s specific farming goals (e.g., maximize yield, drought resistance, organic farming).'),
  location: z.string().optional().describe('The geographical location of the farm, to consider climate. (e.g., "Central Valley, California", "Tropical region of Brazil")'),
});
export type CropRecommendationInput = z.infer<typeof CropRecommendationInputSchema>;

const CropRecommendationOutputSchema = z.object({
  recommendedCrops: z.array(
    z.object({
      name: z.string().describe('The name of the recommended crop.'),
      explanation: z.string().describe('An explanation of why this crop is suitable for the given soil parameters and farming goals.'),
      cultivationTips: z.string().describe('Basic cultivation tips for growing this crop, including planting, watering, and harvesting advice.'),
    })
  ).describe('A list of recommended crops with detailed information.'),
  overallAdvice: z.string().describe('General advice based on the provided soil parameters and farming goals.'),
});
export type CropRecommendationOutput = z.infer<typeof CropRecommendationOutputSchema>;

export async function recommendCrop(input: CropRecommendationInput): Promise<CropRecommendationOutput> {
  return cropRecommendationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'cropRecommendationPrompt',
  input: {schema: CropRecommendationInputSchema},
  output: {schema: CropRecommendationOutputSchema},
  prompt: `You are an expert agricultural advisor for farmers. Your task is to recommend suitable crops based on the provided soil parameters and the farmer's farming goals. You must also provide a clear explanation for each recommendation and basic cultivation tips.

Soil Parameters:
- pH Level: {{{soilpH}}}
- Nitrogen Level: {{{nitrogenLevel}}} ppm
- Phosphorus Level: {{{phosphorusLevel}}} ppm
- Potassium Level: {{{potassiumLevel}}} ppm

Farming Goals: {{{farmingGoals}}}

{{#if location}}
Location: {{{location}}}
{{/if}}

Based on these details, recommend 2-3 crops. For each recommended crop, provide a detailed explanation of why it is suitable, considering the soil and goals. Also, include basic cultivation tips. Conclude with some overall advice for the farmer.`,
});

const cropRecommendationFlow = ai.defineFlow(
  {
    name: 'cropRecommendationFlow',
    inputSchema: CropRecommendationInputSchema,
    outputSchema: CropRecommendationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

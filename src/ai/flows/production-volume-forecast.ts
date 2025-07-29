'use server';

/**
 * @fileOverview Production volume forecast AI agent.
 *
 * - productionVolumeForecast - A function that handles the production volume forecast process.
 * - ProductionVolumeForecastInput - The input type for the productionVolumeForecast function.
 * - ProductionVolumeForecastOutput - The return type for the productionVolumeForecast function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ProductionVolumeForecastInputSchema = z.object({
  recentSalesData: z.string().describe('Recent sales data, including product names and quantities sold.'),
  currentInventoryLevels: z.string().describe('Current inventory levels for each product.'),
});
export type ProductionVolumeForecastInput = z.infer<typeof ProductionVolumeForecastInputSchema>;

const ProductionVolumeForecastOutputSchema = z.object({
  forecast: z.string().describe('Recommended production volume forecast for each product.'),
});
export type ProductionVolumeForecastOutput = z.infer<typeof ProductionVolumeForecastOutputSchema>;

export async function productionVolumeForecast(input: ProductionVolumeForecastInput): Promise<ProductionVolumeForecastOutput> {
  return productionVolumeForecastFlow(input);
}

const prompt = ai.definePrompt({
  name: 'productionVolumeForecastPrompt',
  input: {schema: ProductionVolumeForecastInputSchema},
  output: {schema: ProductionVolumeForecastOutputSchema},
  prompt: `You are a production planning expert at an industrial bakery.

Based on the recent sales data and current inventory levels, provide a production volume forecast for each product.

Recent Sales Data: {{{recentSalesData}}}
Current Inventory Levels: {{{currentInventoryLevels}}}

Forecast:`,
});

const productionVolumeForecastFlow = ai.defineFlow(
  {
    name: 'productionVolumeForecastFlow',
    inputSchema: ProductionVolumeForecastInputSchema,
    outputSchema: ProductionVolumeForecastOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

'use server';

/**
 * @fileOverview Agente de IA para el pronóstico del volumen de producción.
 *
 * - productionVolumeForecast - Una función que maneja el proceso de pronóstico de volumen de producción.
 * - ProductionVolumeForecastInput - El tipo de entrada para la función productionVolumeForecast.
 * - ProductionVolumeForecastOutput - El tipo de retorno para la función productionVolumeForecast.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ProductionVolumeForecastInputSchema = z.object({
  recentSalesData: z.string().describe('Datos de ventas recientes, incluyendo nombres de productos y cantidades vendidas.'),
  currentInventoryLevels: z.string().describe('Niveles de inventario actuales para cada producto.'),
});
export type ProductionVolumeForecastInput = z.infer<typeof ProductionVolumeForecastInputSchema>;

const ProductionVolumeForecastOutputSchema = z.object({
  forecast: z.string().describe('Pronóstico de volumen de producción recomendado para cada producto.'),
});
export type ProductionVolumeForecastOutput = z.infer<typeof ProductionVolumeForecastOutputSchema>;

export async function productionVolumeForecast(input: ProductionVolumeForecastInput): Promise<ProductionVolumeForecastOutput> {
  return productionVolumeForecastFlow(input);
}

const prompt = ai.definePrompt({
  name: 'productionVolumeForecastPrompt',
  input: {schema: ProductionVolumeForecastInputSchema},
  output: {schema: ProductionVolumeForecastOutputSchema},
  prompt: `Eres un experto en planificación de producción en una panadería industrial.

Basado en los datos de ventas recientes y los niveles de inventario actuales, proporciona un pronóstico de volumen de producción para cada producto.

Datos de Ventas Recientes: {{{recentSalesData}}}
Niveles de Inventario Actuales: {{{currentInventoryLevels}}}

Pronóstico:`,
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

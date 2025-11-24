'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating sales reports to identify potential stock shortages.
 *
 * - generateSalesReport - A function that generates a sales report.
 * - SalesReportInput - The input type for the generateSalesReport function.
 * - SalesReportOutput - The return type for the generateSalesReport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SalesReportInputSchema = z.object({
  salesData: z.string().describe('A JSON string containing the sales data to analyze.'),
  language: z.string().describe('The language for the report output (e.g., "en", "ar").'),
});
export type SalesReportInput = z.infer<typeof SalesReportInputSchema>;

const SalesReportOutputSchema = z.object({
  summary: z.string().describe('A summary of the sales data, highlighting potential stock shortages.'),
});
export type SalesReportOutput = z.infer<typeof SalesReportOutputSchema>;

export async function generateSalesReport(input: SalesReportInput): Promise<SalesReportOutput> {
  return salesReportFlow(input);
}

const salesReportPrompt = ai.definePrompt({
  name: 'salesReportPrompt',
  input: {schema: SalesReportInputSchema},
  output: {schema: SalesReportOutputSchema},
  prompt: `You are an AI assistant helping a store manager analyze sales data to identify potential stock shortages.
  Analyze the following sales data and provide a concise summary of any products that may be running low on stock based on recent sales trends.
  Sales Data: {{{salesData}}}
  Focus on identifying products with high sales volume and suggesting potential reorder quantities.
  Respond in a clear and actionable manner.
  The entire response must be in the following language: {{{language}}}.
  `,
});

const salesReportFlow = ai.defineFlow(
  {
    name: 'salesReportFlow',
    inputSchema: SalesReportInputSchema,
    outputSchema: SalesReportOutputSchema,
  },
  async input => {
    const {output} = await salesReportPrompt(input);
    return output!;
  }
);

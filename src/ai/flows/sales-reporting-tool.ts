'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating comprehensive business reports.
 *
 * - generateBusinessReport - A function that generates a business report.
 * - BusinessReportInput - The input type for the generateBusinessReport function.
 * - BusinessReportOutput - The return type for the generateBusinessReport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const BusinessReportInputSchema = z.object({
  salesData: z.string().describe('A JSON string containing recent sales data.'),
  expenseData: z.string().describe('A JSON string containing recent expense data.'),
  purchaseData: z.string().describe('A JSON string containing recent purchase order data (costs of goods).'),
  language: z.string().describe('The language for the report output (e.g., "en", "ar").'),
});
export type BusinessReportInput = z.infer<typeof BusinessReportInputSchema>;

const BusinessReportOutputSchema = z.object({
  summary: z.string().describe('A comprehensive summary of the business health, analyzing sales, expenses, and costs to determine profitability and overall performance.'),
});
export type BusinessReportOutput = z.infer<typeof BusinessReportOutputSchema>;

export async function generateBusinessReport(input: BusinessReportInput): Promise<BusinessReportOutput> {
  return businessReportFlow(input);
}

const businessReportPrompt = ai.definePrompt({
  name: 'businessReportPrompt',
  input: {schema: BusinessReportInputSchema},
  output: {schema: BusinessReportOutputSchema},
  prompt: `You are an AI business analyst. Your task is to provide a clear and concise report on the health of a small retail business.
  
  IMPORTANT: All monetary values in your report must be expressed in Algerian Dinars (DZD).

  Analyze the following data:
  1.  **Sales Data**: This shows the revenue generated.
  2.  **Purchase Data**: This shows the cost of goods sold (what was paid for the products).
  3.  **Expense Data**: This shows operational costs (rent, salaries, etc.).

  Your report should:
  - Calculate the gross profit (Total Sales Revenue - Total Purchase Costs).
  - Calculate the net profit (Gross Profit - Total Expenses).
  - Provide a summary of how the business is performing. Is it profitable? Are there any areas of concern (e.g., high expenses, low sales)?
  - Identify the top-selling products from the sales data.
  - Highlight any potential stock shortages based on sales trends vs. current stock.
  - The entire response must be in the following language: {{{language}}}.

  Here is the data:
  Sales Data: {{{salesData}}}
  Purchase Data: {{{purchaseData}}}
  Expense Data: {{{expenseData}}}
  `,
});

const businessReportFlow = ai.defineFlow(
  {
    name: 'businessReportFlow',
    inputSchema: BusinessReportInputSchema,
    outputSchema: BusinessReportOutputSchema,
  },
  async input => {
    const {output} = await businessReportPrompt(input);
    return output!;
  }
);

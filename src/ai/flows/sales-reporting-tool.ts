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
  summary: z.string().describe('A comprehensive business health summary formatted as an HTML document. The HTML should be well-structured and use TailwindCSS classes for styling.'),
});
export type BusinessReportOutput = z.infer<typeof BusinessReportOutputSchema>;

export async function generateBusinessReport(input: BusinessReportInput): Promise<BusinessReportOutput> {
  return businessReportFlow(input);
}

const businessReportPrompt = ai.definePrompt({
  name: 'businessReportPrompt',
  input: {schema: BusinessReportInputSchema},
  output: {schema: BusinessReportOutputSchema},
  prompt: `You are an AI business analyst. Your task is to provide a clear and concise report on the health of a small retail business, formatted as a single HTML document.

  **CRITICAL INSTRUCTIONS:**
  - Your entire output MUST be a valid HTML document. Do not include any text outside of the HTML structure.
  - Use Tailwind CSS classes for styling. For example: '<h2 class="text-2xl font-bold mt-6 mb-2">Profit Analysis</h2>'.
  - Use semantic HTML tags like <h2>, <h3>, <p>, <ul>, <li>, and <strong>.
  - All monetary values in your report must be expressed in Algerian Dinars (DZD).

  Analyze the following data:
  1.  **Sales Data**: Shows revenue generated.
  2.  **Purchase Data**: Shows the cost of goods sold (COGS).
  3.  **Expense Data**: Shows operational costs (rent, salaries, etc.).

  Your HTML report should contain the following sections:
  1.  **Executive Summary**: A brief, high-level summary of business performance.
  2.  **Profitability Analysis**:
      - Calculate and display Gross Profit (Total Sales Revenue - Total Purchase Costs).
      - Calculate and display Net Profit (Gross Profit - Total Expenses).
      - Provide a summary of how the business is performing. Is it profitable? Are there areas of concern?
  3.  **Sales Performance**:
      - Identify the top-selling products by quantity sold. Display this as an unordered list (<ul>).
  4.  **Inventory Insights**:
      - Highlight any potential stock shortages based on sales trends versus current stock levels. Display this as an unordered list (<ul>).
  
  The entire response, including all text within the HTML, must be in the following language: {{{language}}}.

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

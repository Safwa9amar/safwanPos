
'use server';
/**
 * @fileOverview This file defines a Genkit flow for discovering product information from the web.
 *
 * - findProducts - A function that searches for products based on a user query.
 * - ProductSearchInput - The input type for the findProducts function.
 * - ProductSearchOutput - The return type for the findProducts function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const ProductSearchInputSchema = z.object({
  query: z.string().describe('The user\'s search query for a product or category.'),
});
export type ProductSearchInput = z.infer<typeof ProductSearchInputSchema>;

const ProductSearchOutputSchema = z.object({
  products: z.array(
    z.object({
      name: z.string().describe('The common name of the product.'),
      description: z
        .string()
        .describe('A brief, one-sentence description of the product.'),
      category: z.string().describe('A suitable category for this product.'),
      imageUrl: z
        .string()
        .url()
        .describe('A publicly accessible URL for an image of the product.'),
    })
  ),
});
export type ProductSearchOutput = z.infer<typeof ProductSearchOutputSchema>;

export async function findProducts(input: ProductSearchInput): Promise<ProductSearchOutput> {
  return productSearchFlow(input);
}

const productSearchPrompt = ai.definePrompt({
  name: 'productSearchPrompt',
  input: { schema: ProductSearchInputSchema },
  output: { schema: ProductSearchOutputSchema },
  prompt: `You are a product sourcing expert for a small retail store. Your task is to find information about products based on a user's query.

  **CRITICAL INSTRUCTIONS:**
  - Search the web to find 5-10 real, common products that match the user's query.
  - For each product, search Google Images to find a high-quality, publicly accessible image URL.
  - **VERY IMPORTANT**: The image URL must be a direct, previewable link to an image file (e.g., .jpg, .png, .webp). Do not use data URIs or links to web pages.
  - Provide a concise, one-sentence description for each product.
  - Suggest a relevant, single-word category for each product (e.g., "Electronics", "Groceries", "Apparel").
  - Return the data in the specified JSON format.

  User Query: {{{query}}}
  `,
});

const productSearchFlow = ai.defineFlow(
  {
    name: 'productSearchFlow',
    inputSchema: ProductSearchInputSchema,
    outputSchema: ProductSearchOutputSchema,
  },
  async (input) => {
    const { output } = await productSearchPrompt(input);
    return output!;
  }
);

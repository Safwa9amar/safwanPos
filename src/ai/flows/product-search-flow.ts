
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
import * as cheerio from 'cheerio';

const ProductSearchInputSchema = z.object({
  query: z.string().describe('The user\'s search query for a product or category.'),
});
export type ProductSearchInput = z.infer<typeof ProductSearchInputSchema>;

const ProductInfoSchema = z.object({
  name: z.string().describe('The common name of the product.'),
  description: z
    .string()
    .describe('A brief, one-sentence description of the product.'),
  category: z.string().describe('A suitable category for this product.'),
});

const ProductSearchOutputSchema = z.object({
  products: z.array(
    ProductInfoSchema.extend({
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

// 1. Define a prompt to get product ideas from the user query
const productIdeasPrompt = ai.definePrompt({
    name: 'productIdeasPrompt',
    input: { schema: ProductSearchInputSchema },
    output: { schema: z.object({ products: z.array(ProductInfoSchema) }) },
    prompt: `You are a product sourcing expert for a small retail store. Your task is to find ideas for products based on a user's query.

    **CRITICAL INSTRUCTIONS:**
    - Brainstorm 5-10 real, common products that match the user's query.
    - Provide a concise, one-sentence description for each product.
    - Suggest a relevant, single-word category for each product (e.g., "Electronics", "Groceries", "Apparel").
    - Return the data in the specified JSON format.

    User Query: {{{query}}}
    `,
});

// 2. Define the main flow
const productSearchFlow = ai.defineFlow(
  {
    name: 'productSearchFlow',
    inputSchema: ProductSearchInputSchema,
    outputSchema: ProductSearchOutputSchema,
  },
  async (input) => {
    // Step 1: Get product ideas from the LLM
    const ideasResponse = await productIdeasPrompt(input);
    const productIdeas = ideasResponse.output?.products || [];

    if (productIdeas.length === 0) {
        return { products: [] };
    }
    
    // Step 2: For each product idea, scrape Google Images to find a real image URL
    const productsWithImages = await Promise.all(
        productIdeas.map(async (product) => {
            try {
                const imageUrl = await scrapeGoogleImages(product.name);
                return { ...product, imageUrl };
            } catch (error) {
                console.error(`Failed to get image for ${product.name}:`, error);
                // Fallback or skip if image scraping fails
                return { ...product, imageUrl: 'https://picsum.photos/seed/placeholder/400/400' };
            }
        })
    );

    return { products: productsWithImages };
  }
);


/**
 * Scrapes Google Images for a given query and returns the URL of the first image result.
 * @param query The search query.
 * @returns A promise that resolves to the image URL.
 */
async function scrapeGoogleImages(query: string): Promise<string> {
    const searchQuery = encodeURIComponent(query);
    const searchUrl = `https://www.google.com/search?q=${searchQuery}&tbm=isch`;

    const response = await fetch(searchUrl, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch Google Images page: ${response.statusText}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Find the first link that looks like an image result.
    const firstImageLink = $('a[href^="/imgres"]');

    if (firstImageLink.length > 0) {
        const href = firstImageLink.attr('href');
        if (href) {
            const urlParams = new URLSearchParams(href.split('?')[1]);
            const imgurl = urlParams.get('imgurl');
            if (imgurl) {
                return imgurl;
            }
        }
    }

    // Fallback if the primary method fails
    const firstImgTag = $('img[src^="data:image"]');
     if (firstImgTag.length > 0) {
        const parentAnchor = firstImgTag.closest('a');
        if (parentAnchor && parentAnchor.attr('href')?.startsWith('/imgres')) {
             const href = parentAnchor.attr('href')!;
             const urlParams = new URLSearchParams(href.split('?')[1]);
             const imgurl = urlParams.get('imgurl');
             if (imgurl) return imgurl;
        }
    }

    throw new Error('Could not find a valid image URL in the search results.');
}

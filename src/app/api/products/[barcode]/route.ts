
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserIdFromRequest } from '@/lib/server-auth';

export async function GET(
  request: Request,
  { params }: { params: { barcode: string } }
) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
        return new NextResponse('Unauthorized', { status: 401 });
    }
      
    const { barcode } = params;
    const product = await prisma.product.findFirst({
      where: { barcode, userId },
    });

    if (!product) {
      return new NextResponse('Product not found', { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('[PRODUCT_GET]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}

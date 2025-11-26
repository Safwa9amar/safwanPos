
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserIdFromRequest } from '@/lib/server-auth';

export async function GET(
  request: Request,
  { params }: { params: { barcode: string } }
) {
  try {
    const userId = await getUserIdFromRequest();
    if (!userId) {
        return new NextResponse('Unauthorized', { status: 401 });
    }
      
    const { barcode } = params;

    const barcodeEntry = await prisma.barcode.findUnique({
      where: {
        code_userId: {
          code: barcode,
          userId: userId,
        }
      },
      include: {
        product: true
      }
    });

    if (!barcodeEntry || !barcodeEntry.product) {
      return new NextResponse('Product not found', { status: 404 });
    }

    return NextResponse.json(barcodeEntry.product);
  } catch (error) {
    console.error('[PRODUCT_GET]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}

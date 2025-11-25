
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAdminAuth } from '@/lib/firebase-admin';

async function getUserIdFromRequest(request: Request): Promise<string | null> {
    const authorization = request.headers.get('Authorization');
    if (authorization?.startsWith('Bearer ')) {
        const idToken = authorization.split('Bearer ')[1];
        try {
            const adminAuth = getAdminAuth();
            const decodedToken = await adminAuth.verifyIdToken(idToken);
            return decodedToken.uid;
        } catch (error) {
            console.error("Error verifying ID token:", error);
            return null;
        }
    }
    return null;
}

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

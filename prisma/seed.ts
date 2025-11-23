import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const products = [
    {
      name: 'Organic Apples',
      barcode: '100001',
      price: 2.99,
      stock: 150,
    },
    {
      name: 'Whole Wheat Bread',
      barcode: '100002',
      price: 3.49,
      stock: 75,
    },
    {
      name: 'Free-Range Eggs (Dozen)',
      barcode: '100003',
      price: 4.99,
      stock: 50,
    },
    {
      name: 'Almond Milk (1L)',
      barcode: '100004',
      price: 3.99,
      stock: 60,
    },
    {
      name: 'Avocado',
      barcode: '100005',
      price: 1.99,
      stock: 80,
    },
    {
      name: 'Quinoa (500g)',
      barcode: '100006',
      price: 6.99,
      stock: 40,
    },
    {
      name: 'Greek Yogurt (500g)',
      barcode: '100007',
      price: 4.49,
      stock: 55,
    },
    {
      name: 'Spinach (Bag)',
      barcode: '100008',
      price: 2.79,
      stock: 90,
    },
    {
      name: 'Chicken Breast (1lb)',
      barcode: '100009',
      price: 7.99,
      stock: 30,
    },
    {
      name: 'Dark Chocolate Bar (70%)',
      barcode: '100010',
      price: 3.29,
      stock: 100,
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { barcode: product.barcode },
      update: {},
      create: product,
    });
  }

  console.log('Seed data has been added.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

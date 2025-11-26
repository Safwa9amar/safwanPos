import { PrismaClient, UserRole } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // 1. Create a dummy user to own the seed data
  const seedUser = await prisma.user.upsert({
    where: { email: 'seeduser@example.com' },
    update: {},
    create: {
      id: 'seed-user-id',
      name: 'Seed User',
      email: 'seeduser@example.com',
      role: UserRole.ADMIN,
      password : 'seedpassword',
    },
  });

  console.log(`Upserted seed user with ID: ${seedUser.id}`);


  const products = [
    {
      name: 'Organic Apples',
      barcode: '100001',
      price: 2.99,
      stock: 150,
      costPrice: 1.5,
      unit: 'EACH',
      image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b69665?q=80&w=600',
    },
    {
      name: 'Whole Wheat Bread',
      barcode: '100002',
      price: 3.49,
      stock: 75,
      costPrice: 2.0,
      unit: 'EACH',
      image: 'https://images.unsplash.com/photo-1598373182133-52452f7691ef?q=80&w=600',
    },
    {
      name: 'Free-Range Eggs (Dozen)',
      barcode: '100003',
      price: 4.99,
      stock: 50,
      costPrice: 3.0,
      unit: 'EACH',
      image: 'https://images.unsplash.com/photo-1598965674391-5355a2a7813d?q=80&w=600',
    },
    {
      name: 'Almond Milk (1L)',
      barcode: '100004',
      price: 3.99,
      stock: 60,
      costPrice: 2.5,
      unit: 'L',
      image: 'https://images.unsplash.com/photo-1620700753574-89495b6028c5?q=80&w=600',
    },
    {
      name: 'Avocado',
      barcode: '100005',
      price: 1.99,
      stock: 80,
      costPrice: 1.0,
      unit: 'EACH',
      image: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?q=80&w=600',
    },
    {
      name: 'Quinoa (500g)',
      barcode: '100006',
      price: 6.99,
      stock: 40,
      costPrice: 4.0,
      unit: 'G',
      image: 'https://images.unsplash.com/photo-1600438131332-9dc496335198?q=80&w=600',
    },
    {
      name: 'Greek Yogurt (500g)',
      barcode: '100007',
      price: 4.49,
      stock: 55,
      costPrice: 2.8,
      unit: 'G',
      image: 'https://images.unsplash.com/photo-1562119462-8945a8a1789d?q=80&w=600',
    },
    {
      name: 'Spinach (Bag)',
      barcode: '100008',
      price: 2.79,
      stock: 90,
      costPrice: 1.2,
      unit: 'EACH',
      image: 'https://images.unsplash.com/photo-1576045057995-568f588f21fb?q=80&w=600',
    },
    {
      name: 'Chicken Breast (1lb)',
      barcode: '100009',
      price: 7.99,
      stock: 30,
      costPrice: 5.0,
      unit: 'KG',
      image: 'https://images.unsplash.com/photo-1605104273037-c75266854131?q=80&w=600',
    },
    {
      name: 'Dark Chocolate Bar (70%)',
      barcode: '100010',
      price: 3.29,
      stock: 100,
      costPrice: 1.8,
      unit: 'EACH',
      image: 'https://images.unsplash.com/photo-1549472558-e3b4a496a434?q=80&w=600',
    },
  ];

  // 2. Create products and associate them with the dummy user
  for (const product of products) {
    await prisma.product.upsert({
      where: { barcode_userId: { barcode: product.barcode, userId: seedUser.id } },
      update: {},
      create: {
        ...product,
        userId: seedUser.id,
      },
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

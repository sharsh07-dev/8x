import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const coupon = await prisma.coupon.upsert({
    where: { code: 'PEHNO300' },
    update: {},
    create: {
      code: 'PEHNO300',
      type: 'FIXED',
      value: 300,
      minOrderValue: 1000,
      startDate: new Date(),
      isActive: true,
    },
  });
  console.log('Coupon created:', coupon);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

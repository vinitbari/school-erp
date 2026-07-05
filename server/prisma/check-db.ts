import { PrismaClient } from '@prisma/client';

process.env.DATABASE_URL = "postgresql://neondb_owner:npg_BdS5sjHc2akM@ep-sweet-breeze-at14nwmr-pooler.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";
const prisma = new PrismaClient();

async function main() {
  const receipts = await prisma.receipt.count();
  const onlinePayments = await prisma.onlinePayment.count();
  const deposits = await prisma.deposit.count();
  const admissions = await prisma.admission.count();
  
  console.log(`DB Counts:`);
  console.log(`Receipts: ${receipts}`);
  console.log(`OnlinePayments: ${onlinePayments}`);
  console.log(`Deposits: ${deposits}`);
  console.log(`Admissions: ${admissions}`);
}

main().finally(() => prisma.$disconnect());

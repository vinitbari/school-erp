import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

process.env.DATABASE_URL = "postgresql://neondb_owner:npg_BdS5sjHc2akM@ep-sweet-breeze-at14nwmr-pooler.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

const prisma = new PrismaClient();

async function main() {
  const school = await prisma.school.findFirst();
  if (!school) {
    console.error('No school found in DB');
    return;
  }

  await prisma.school.update({
    where: { id: school.id },
    data: { name: 'EK-Yavatmal-Arni', code: 'EK-Yavatmal-Arni' }
  });

  const passwordHash = await bcrypt.hash('Euro@7474', 12);

  const user = await prisma.user.upsert({
    where: { username: 'Rahul.Khandale' },
    update: {
      passwordHash,
      schoolId: school.id,
      role: 'SCHOOL_ADMIN',
    },
    create: {
      username: 'Rahul.Khandale',
      email: 'rahul.khandale@eurokids.local',
      passwordHash,
      firstName: 'Rahul',
      lastName: 'Khandale',
      role: 'SCHOOL_ADMIN',
      schoolId: school.id,
    },
  });

  console.log(`✅ Created/Updated user: ${user.username} with password 'Euro@7474' and linked to school ${school.name}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { PrismaClient } from '@prisma/client';
import { config } from './index';

const basePrisma = new PrismaClient({
  log: config.isDev ? ['query', 'error', 'warn'] : ['error'],
});

const modelsWithSoftDelete = ['User', 'Student', 'Parent', 'Enquiry', 'Admission', 'Invoice', 'Receipt'];

export const prisma = basePrisma.$extends({
  query: {
    $allModels: {
      async findMany({ model, args, query }) {
        if (modelsWithSoftDelete.includes(model)) {
          args.where = { ...args.where, deletedAt: null };
        }
        return query(args);
      },
      async findFirst({ model, args, query }) {
        if (modelsWithSoftDelete.includes(model)) {
          args.where = { ...args.where, deletedAt: null };
        }
        return query(args);
      },
      async delete({ model, args, query }) {
        if (modelsWithSoftDelete.includes(model)) {
          // @ts-ignore
          const modelName = model.charAt(0).toLowerCase() + model.slice(1);
          // @ts-ignore
          return basePrisma[modelName].update({
            ...args,
            data: { deletedAt: new Date() },
          });
        }
        return query(args);
      },
      async deleteMany({ model, args, query }) {
        if (modelsWithSoftDelete.includes(model)) {
          // @ts-ignore
          const modelName = model.charAt(0).toLowerCase() + model.slice(1);
          // @ts-ignore
          return basePrisma[modelName].updateMany({
            ...args,
            data: { deletedAt: new Date() },
          });
        }
        return query(args);
      },
    },
  },
}) as unknown as PrismaClient; // Cast to avoid deep type issues across the app

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

if (config.isDev) {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = prisma;
  }
}

export default prisma;

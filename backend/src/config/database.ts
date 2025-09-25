import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: ['query', 'error', 'warn'],
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export async function connectDatabase() {
  try {
    await prisma.$connect();
    console.log(' Connexion � MySQL r�ussie');
    return true;
  } catch (error) {
    console.error('L Erreur de connexion � MySQL:', error);
    return false;
  }
}

export async function disconnectDatabase() {
  try {
    await prisma.$disconnect();
    console.log('= D�connexion de MySQL r�ussie');
  } catch (error) {
    console.error('L Erreur lors de la d�connexion:', error);
  }
}
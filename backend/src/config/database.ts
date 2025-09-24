import { PrismaClient } from '../generated/prisma/index.js';

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
    console.log(' Connexion à MySQL réussie');
    return true;
  } catch (error) {
    console.error('L Erreur de connexion à MySQL:', error);
    return false;
  }
}

export async function disconnectDatabase() {
  try {
    await prisma.$disconnect();
    console.log('= Déconnexion de MySQL réussie');
  } catch (error) {
    console.error('L Erreur lors de la déconnexion:', error);
  }
}
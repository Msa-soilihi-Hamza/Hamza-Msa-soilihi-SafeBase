import { connectDatabase, disconnectDatabase, prisma } from './config/database.js';

async function testConnection() {
  console.log('🔄 Test de connexion à MySQL...\n');

  const connected = await connectDatabase();

  if (connected) {
    try {
      const result = await prisma.$queryRaw`SELECT 1 as test`;
      console.log('📊 Test query réussi:', result);

      const dbVersion = await prisma.$queryRaw`SELECT VERSION() as version`;
      console.log('🗄️  Version MySQL:', dbVersion);

    } catch (error) {
      console.error('❌ Erreur lors de l\'exécution de la query:', error);
    }
  }

  await disconnectDatabase();
  process.exit(connected ? 0 : 1);
}

testConnection();
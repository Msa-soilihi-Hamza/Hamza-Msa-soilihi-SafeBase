import { prisma } from './config/database.js';

async function seedTestData() {
  try {
    console.log('🌱 Création des données de test...\n');

    // Créer un utilisateur test
    const testUser = await prisma.user.create({
      data: {
        email: 'test@safebase.com',
        password: 'password123',
        name: 'Test User',
        phone: '+33123456789',
        role: 'ADMIN'
      }
    });
    console.log('✅ Utilisateur test créé:', testUser.name);

    // Créer une base de données MySQL test
    const testDatabase = await prisma.database.create({
      data: {
        name: 'SafeBase Test DB',
        type: 'MYSQL',
        host: 'localhost',
        port: 3308,
        username: 'root',
        password: '',
        databaseName: 'safebase',
        description: 'Base de données de test pour SafeBase',
        userId: testUser.id
      }
    });
    console.log('✅ Base de données test créée:', testDatabase.name);

    // Créer une seconde base PostgreSQL test
    const testDatabase2 = await prisma.database.create({
      data: {
        name: 'PostgreSQL Test',
        type: 'POSTGRESQL',
        host: 'localhost',
        port: 5432,
        username: 'postgres',
        password: 'postgres',
        databaseName: 'testdb',
        description: 'Base PostgreSQL pour tests',
        userId: testUser.id
      }
    });
    console.log('✅ Base PostgreSQL test créée:', testDatabase2.name);

    // Créer quelques logs de test
    await prisma.log.create({
      data: {
        level: 'INFO',
        message: 'Données de test initialisées',
        action: 'SEED_TEST_DATA',
        metadata: {
          databases: 2,
          users: 1
        },
        userId: testUser.id
      }
    });

    console.log('\n🎯 **Données de test créées avec succès !**');
    console.log(`\n📊 **IDs pour les tests :**`);
    console.log(`   User ID: ${testUser.id}`);
    console.log(`   MySQL DB ID: ${testDatabase.id}`);
    console.log(`   PostgreSQL DB ID: ${testDatabase2.id}`);

    console.log(`\n🔗 **URLs de test :**`);
    console.log(`   GET http://localhost:3002/api/databases/all`);
    console.log(`   GET http://localhost:3002/api/backups/create?databaseId=${testDatabase.id}`);

    return {
      user: testUser,
      databases: [testDatabase, testDatabase2]
    };

  } catch (error: any) {
    if (error.code === 'P2002') {
      console.log('⚠️  Les données de test existent déjà.');

      // Récupérer les données existantes
      const existingUser = await prisma.user.findUnique({
        where: { email: 'test@safebase.com' },
        include: { databases: true }
      });

      if (existingUser) {
        console.log(`\n📊 **IDs existants :**`);
        console.log(`   User ID: ${existingUser.id}`);
        existingUser.databases.forEach(db => {
          console.log(`   ${db.type} DB ID: ${db.id} (${db.name})`);
        });

        if (existingUser.databases.length > 0) {
          console.log(`\n🔗 **URLs de test :**`);
          console.log(`   GET http://localhost:3002/api/backups/create?databaseId=${existingUser.databases[0].id}`);
        }
      }
    } else {
      console.error('❌ Erreur lors de la création des données de test:', error);
    }
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le script si appelé directement
console.log('🔄 Démarrage du script de test...');
seedTestData().then(() => {
  console.log('✅ Script terminé');
  process.exit(0);
}).catch(error => {
  console.error('❌ Erreur:', error);
  process.exit(1);
});

export { seedTestData };
const { PrismaClient } = require('@prisma/client');
const dotenv = require('dotenv');

dotenv.config();

// Client pour la base source (locale)
const sourcePrisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres:dera@localhost:5432/coloc_antananarivo?schema=public"
    }
  }
});

// Client pour la base destination (Neon) - utilise DATABASE_URL du .env
const targetPrisma = new PrismaClient();

async function migrateTable(tableName, transformFunction = null) {
  console.log(`📦 Migration de la table: ${tableName}`);
  
  try {
    const data = await sourcePrisma[tableName].findMany();
    console.log(`📊 ${data.length} enregistrements trouvés dans ${tableName}`);
    
    if (data.length > 0) {
      let processedData = data;
      
      // Appliquer une transformation si nécessaire
      if (transformFunction) {
        processedData = data.map(transformFunction);
      }
      
      await targetPrisma[tableName].createMany({
        data: processedData,
        skipDuplicates: true
      });
      console.log(`✅ ${data.length} enregistrements migrés dans ${tableName}`);
    }
    
    return data.length;
  } catch (error) {
    console.error(`❌ Erreur sur la table ${tableName}:`, error.message);
    return 0;
  }
}

async function migrateData() {
  console.log('🚀 Début de la migration vers Neon...');
  
  try {
    // Test de connexion aux deux bases
    console.log('🔌 Test de connexion à la base source...');
    await sourcePrisma.$connect();
    console.log('✅ Connexion source OK');
    
    console.log('🔌 Test de connexion à la base Neon...');
    await targetPrisma.$connect();
    console.log('✅ Connexion Neon OK');
    
    // Migrer les tables dans l'ordre pour respecter les contraintes de clés étrangères
    const migrationSteps = [
      {
        table: 'user',
        transform: (item) => {
          const { id, ...rest } = item;
          return rest;
        }
      },
      {
        table: 'property', 
        transform: (item) => {
          const { id, ...rest } = item;
          return rest;
        }
      },
      {
        table: 'announcement',
        transform: (item) => {
          const { id, ...rest } = item;
          return rest;
        }
      },
      {
        table: 'contactMessage',
        transform: (item) => {
          const { id, ...rest } = item;
          return rest;
        }
      },
      {
        table: 'conversation', 
        transform: (item) => {
          const { id, ...rest } = item;
          return rest;
        }
      },
      {
        table: 'message',
        transform: (item) => {
          const { id, ...rest } = item;
          return rest;
        }
      },
      {
        table: 'appointment',
        transform: (item) => {
          const { id, ...rest } = item;
          return rest;
        }
      }
    ];
    
    let totalMigrated = 0;
    
    for (const step of migrationSteps) {
      const count = await migrateTable(step.table, step.transform);
      totalMigrated += count;
      
      // Petite pause entre les tables pour éviter les timeouts
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log(`🎉 Migration terminée! ${totalMigrated} enregistrements migrés au total`);
    
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
  } finally {
    await sourcePrisma.$disconnect();
    await targetPrisma.$disconnect();
    process.exit(0);
  }
}

migrateData();
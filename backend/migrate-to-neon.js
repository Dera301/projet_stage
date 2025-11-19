const { PrismaClient } = require('@prisma/client');
const dotenv = require('dotenv');

dotenv.config();

async function main() {
  console.log('🚀 Début de la migration et seeding...');
  
  const prisma = new PrismaClient();
  
  try {
    // Test de connexion
    await prisma.$connect();
    console.log('✅ Connexion à la base de données réussie');
    
    // Vérifier si des données existent déjà
    const userCount = await prisma.user.count();
    const propertyCount = await prisma.property.count();
    
    console.log(`📊 Données existantes - Users: ${userCount}, Properties: ${propertyCount}`);
    
    if (userCount === 0 && propertyCount === 0) {
      console.log('🌱 Aucune donnée trouvée, création de données de test...');
      
      // Créer un utilisateur admin de test
      const adminUser = await prisma.user.create({
        data: {
          email: 'admin@coloc-tana.com',
          firstName: 'Admin',
          lastName: 'System',
          phone: '+261340000000',
          userType: 'admin',
          isVerified: true,
          password: '$2a$10$exampleHashedPasswordForTesting'
        }
      });
      
      console.log('✅ Utilisateur admin créé');
      
      // Créer des propriétés de test
      const properties = await prisma.property.createMany({
        data: [
          {
            title: 'Belle colocation à Analakely',
            description: 'Superbe appartement avec 3 chambres disponibles près du centre ville',
            address: 'Analakely, Antananarivo',
            district: 'Analakely',
            price: 350000,
            deposit: 100000,
            availableRooms: 3,
            totalRooms: 4,
            propertyType: 'apartment',
            amenities: 'WiFi, Cuisine équipée, Salons communs',
            ownerId: adminUser.id,
            latitude: -18.910012,
            longitude: 47.525581
          },
          {
            title: 'Maison étudiante à Ankatso',
            description: 'Maison spacieuse parfaite pour étudiants, proche campus',
            address: 'Ankatso, Antananarivo',
            district: 'Ankatso',
            price: 280000,
            deposit: 80000,
            availableRooms: 2,
            totalRooms: 3,
            propertyType: 'house',
            amenities: 'Jardin, Parking, Buanderie',
            ownerId: adminUser.id,
            latitude: -18.920000,
            longitude: 47.560000
          }
        ]
      });
      
      console.log('✅ Propriétés de test créées');
      
      // Créer des annonces de test
      await prisma.announcement.createMany({
        data: [
          {
            authorId: adminUser.id,
            content: 'Je cherche un colocataire pour partager un appartement à Ivandry. Budget 200k Ar/mois.',
            contact: 'admin@coloc-tana.com'
          },
          {
            authorId: adminUser.id,
            content: 'Disponible: chambre dans maison étudiante à Anosy. Proche université et transports.',
            contact: 'admin@coloc-tana.com'
          }
        ]
      });
      
      console.log('✅ Annonces de test créées');
    } else {
      console.log('ℹ️  Données déjà présentes, pas de seeding nécessaire');
    }
    
    console.log('🎉 Migration et seeding terminés avec succès!');
    
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
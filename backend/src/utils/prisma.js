const { PrismaClient } = require('@prisma/client');

// Singleton pattern pour Prisma Client
// Évite de créer plusieurs instances et gère correctement les connexions
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// Gestion propre de la fermeture lors de l'arrêt de l'application
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

module.exports = prisma;


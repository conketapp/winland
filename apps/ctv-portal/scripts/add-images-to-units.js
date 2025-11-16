const { PrismaClient } = require('../lib/generated/prisma');

const prisma = new PrismaClient();

const defaultImages = JSON.stringify([
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1560448204-61dc36dc98c8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
]);

async function addImagesToUnits() {
  try {
    console.log('🔄 Adding images to units without images...');

    const result = await prisma.unit.updateMany({
      where: {
        OR: [
          { images: null },
          { images: '' }
        ]
      },
      data: {
        images: defaultImages
      }
    });

    console.log(`✅ Updated ${result.count} units with default images`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addImagesToUnits();

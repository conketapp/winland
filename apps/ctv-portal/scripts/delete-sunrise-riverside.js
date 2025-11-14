const { PrismaClient } = require('../lib/generated/prisma');

const prisma = new PrismaClient();

async function deleteSunriseRiverside() {
    try {
        console.log('🗑️  Deleting Sunrise Riverside project...');

        // Find the project
        const project = await prisma.project.findUnique({
            where: { code: 'SUNRISE-RIVERSIDE' }
        });

        if (!project) {
            console.log('ℹ️  Project Sunrise Riverside not found');
            return;
        }

        // Delete the project (cascade will delete buildings, floors, and units)
        await prisma.project.delete({
            where: { id: project.id }
        });

        console.log('✅ Successfully deleted Sunrise Riverside project');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

deleteSunriseRiverside();

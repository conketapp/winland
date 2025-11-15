const { PrismaClient } = require('../lib/generated/prisma');

const prisma = new PrismaClient();

async function addSunriseImages() {
    try {
        console.log('🖼️  Adding images to Sunrise Riverside project...');

        // Find the project
        const project = await prisma.project.findUnique({
            where: { code: 'SUNRISE-RIVERSIDE' }
        });

        if (!project) {
            console.error('❌ Project Sunrise Riverside not found!');
            return;
        }

        console.log('✅ Found project:', project.name);

        // Local image URLs from public folder
        const imageUrls = [
            '/images/projects/sunrise_0.jpg',
            '/images/projects/sunrise_1.jpg',
            '/images/projects/sunrise_2.jpg',
            '/images/projects/sunrise_3.jpg',
            '/images/projects/sunrise_4.jpg'
        ];

        // Convert to JSON string (comma-separated for the images field)
        const imagesString = imageUrls.join(',');

        // Update project with images
        await prisma.project.update({
            where: { id: project.id },
            data: {
                images: imagesString
            }
        });

        console.log('✅ Successfully added images to project');
        console.log('   Images:', imageUrls.length);
        console.log('   URLs:', imageUrls.join('\n         '));

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

addSunriseImages();

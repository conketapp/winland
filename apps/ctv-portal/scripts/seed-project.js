/**
 * Seed Script: Generate "Lê Văn Thiêm Luxury" Project
 * Run: node scripts/seed-project.js
 */

const { PrismaClient } = require('../lib/generated/prisma');
const prisma = new PrismaClient();

// Helper functions
const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

const directions = ["Đông", "Tây", "Nam", "Bắc", "Đông Nam", "Tây Nam", "Đông Bắc", "Tây Bắc"];
const views = ["City view", "River view", "Park view", "Pool view", "Lake view", "Golf view", "Skyline view"];
const areas = [120, 150, 185, 210, 100];
const prices = [6200000000, 7850000000, 8532000000, 9100000000, 10250000000, 5500000000];
const bedrooms = [2, 3, 4, 5];
const bathrooms = [1, 2, 3];
const statuses = ['AVAILABLE', 'RESERVED_BOOKING', 'DEPOSITED', 'SOLD'];

const descriptions = [
    "Căn hộ thiết kế hiện đại với không gian mở, ban công rộng và ánh sáng tự nhiên chan hòa. Vị trí thuận tiện gần khu tiện ích, trường học và trung tâm thương mại.",
    "Căn hộ nằm trong khu dân cư yên tĩnh, có view sông thoáng mát, phù hợp cho gia đình nhỏ. Nội thất được hoàn thiện cao cấp, phòng khách thông với ban công giúp tận dụng tối đa ánh sáng tự nhiên.",
    "Căn hộ nổi bật với thiết kế sang trọng, có sân vườn riêng và không gian sinh hoạt ngoài trời. Phù hợp với gia đình đa thế hệ, kết nối tiện ích nội khu như hồ bơi, công viên, khu thể thao.",
];

const apartmentImages = [
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1560448204-61dc36dc98c8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1560448075-cbc16bb4af8e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1560448075-bb485b067938?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
];

async function main() {
    console.log('🌱 Starting seed...');

    // Find or create a user to be the creator
    let creator = await prisma.user.findFirst({
        where: { role: 'ADMIN' }
    });

    if (!creator) {
        // Try to find any user
        creator = await prisma.user.findFirst();
        
        if (!creator) {
            console.log('Creating admin user...');
            creator = await prisma.user.create({
                data: {
                    phone: '0900000000',
                    email: 'admin@winland.com',
                    password: 'hashed_password',
                    fullName: 'Admin Winland',
                    role: 'ADMIN',
                    isActive: true,
                }
            });
        }
    }

    console.log('👤 Creator:', creator.fullName);

    // Check if project already exists
    const existingProject = await prisma.project.findFirst({
        where: { code: 'LVT-LUXURY' }
    });

    if (existingProject) {
        console.log('⚠️  Project "Lê Văn Thiêm Luxury" already exists. Deleting...');
        await prisma.project.delete({
            where: { id: existingProject.id }
        });
    }

    // Create Project
    console.log('🏗️  Creating project...');
    const project = await prisma.project.create({
        data: {
            name: 'Lê Văn Thiêm Luxury',
            code: 'LVT-LUXURY',
            status: 'OPEN',
            developer: 'Winland Group',
            location: 'Thanh Xuân, Hà Nội',
            address: 'Số 123 Lê Văn Thiêm, Thanh Xuân, Hà Nội',
            district: 'Thanh Xuân',
            city: 'Hà Nội',
            latitude: 21.0012,
            longitude: 105.8055,
            totalArea: 50000,
            totalBuildings: 4,
            totalUnits: 200,
            priceFrom: 5500000000,
            priceTo: 10250000000,
            description: 'Dự án cao cấp tại trung tâm Hà Nội với đầy đủ tiện ích hiện đại',
            amenities: 'Hồ bơi, Gym, Công viên, Khu vui chơi trẻ em, Siêu thị, Bãi đỗ xe',
            commissionRate: 2.0,
            createdBy: creator.id,
        }
    });

    console.log('✅ Project created:', project.name);

    // Create 4 Buildings (LK1, LK2, LK3, LK4)
    const buildings = [];
    for (let i = 1; i <= 4; i++) {
        const buildingCode = `LK${i}`;
        console.log(`🏢 Creating building ${buildingCode}...`);

        const building = await prisma.building.create({
            data: {
                projectId: project.id,
                code: buildingCode,
                name: `Tòa ${buildingCode}`,
                floors: 10,
                description: `Tòa nhà ${buildingCode} với 10 tầng, mỗi tầng 5 căn hộ`,
            }
        });

        buildings.push(building);

        // Create Floors (5-14, total 10 floors)
        const floors = [];
        for (let floorNum = 5; floorNum <= 14; floorNum++) {
            const floor = await prisma.floor.create({
                data: {
                    buildingId: building.id,
                    number: floorNum,
                }
            });
            floors.push(floor);
        }

        console.log(`  📐 Created ${floors.length} floors`);

        // Create Units (5 units per floor)
        let unitCount = 0;
        for (const floor of floors) {
            for (let unitOnFloor = 1; unitOnFloor <= 5; unitOnFloor++) {
                const unitNumber = `${String(floor.number).padStart(2, '0')}${String(unitOnFloor).padStart(2, '0')}`;
                const unitCode = `${buildingCode}-${unitNumber}`;
                const price = getRandom(prices);
                const area = getRandom(areas);

                // Generate 3-5 random images
                const imageCount = Math.floor(Math.random() * 3) + 3;
                const selectedImages = [];
                for (let j = 0; j < imageCount; j++) {
                    selectedImages.push(apartmentImages[j % apartmentImages.length]);
                }

                await prisma.unit.create({
                    data: {
                        projectId: project.id,
                        buildingId: building.id,
                        floorId: floor.id,
                        code: unitCode,
                        unitNumber: unitNumber,
                        status: getRandom(statuses),
                        price: price,
                        area: area,
                        bedrooms: getRandom(bedrooms),
                        bathrooms: getRandom(bathrooms),
                        direction: getRandom(directions),
                        balcony: Math.random() > 0.3,
                        view: getRandom(views),
                        description: getRandom(descriptions),
                        images: JSON.stringify(selectedImages),
                        commissionRate: 2.0,
                    }
                });

                unitCount++;
            }
        }

        console.log(`  🏠 Created ${unitCount} units`);
    }

    console.log('\n✨ Seed completed successfully!');
    console.log(`📊 Summary:`);
    console.log(`   - Project: ${project.name}`);
    console.log(`   - Buildings: ${buildings.length}`);
    console.log(`   - Total Units: ${buildings.length * 10 * 5} (${buildings.length} buildings × 10 floors × 5 units)`);
}

main()
    .catch((e) => {
        console.error('❌ Error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

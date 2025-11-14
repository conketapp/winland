const { PrismaClient } = require('../lib/generated/prisma');

const prisma = new PrismaClient();

async function seedSunriseRiverside() {
    try {
        console.log('🌅 Creating Sunrise Riverside project...');

        // Find a user to be the creator (any user will do)
        let creator = await prisma.user.findFirst({
            where: { role: { in: ['ADMIN', 'SUPER_ADMIN'] } }
        });

        // If no admin, use any CTV user
        if (!creator) {
            creator = await prisma.user.findFirst();
        }

        if (!creator) {
            console.error('❌ No user found to create project');
            return;
        }

        console.log(`✅ Using creator: ${creator.fullName} (${creator.role})`);

        // Check if project already exists
        const existingProject = await prisma.project.findUnique({
            where: { code: 'SUNRISE-RIVERSIDE' }
        });

        if (existingProject) {
            console.log('ℹ️  Project Sunrise Riverside already exists');
            return;
        }

        // Create the project
        const project = await prisma.project.create({
            data: {
                name: 'Sunrise Riverside',
                code: 'SUNRISE-RIVERSIDE',
                status: 'OPEN',
                developer: 'Novaland Group',
                location: 'Khu Nam Sài Gòn',
                address: 'Đường Nguyễn Hữu Thọ, Phường Tân Hưng, Quận 7',
                district: 'Quận 7',
                city: 'Hồ Chí Minh',
                latitude: 10.7359,
                longitude: 106.7185,
                totalArea: 39300, // 3.93 ha = 39,300 m²
                totalBuildings: 8,
                totalUnits: 2200,
                priceFrom: 1600000000, // 1.6 tỷ
                priceTo: 4600000000, // 4.6 tỷ
                description: `Sunrise Riverside là dự án căn hộ cao cấp do Novaland Group phát triển, tọa lạc tại vị trí đắc địa ở Quận 7, TP.HCM.

**Thông tin dự án:**
- Diện tích: 3,93 ha
- Số tòa: 8 tòa (E1, E2, G1, G2, G3, G4, G5, G6)
- Số căn hộ: 2.200 căn
- Chủ đầu tư: Novaland Group

**Giá bán:**
- Giá bán căn hộ: từ 40 - 54.8 triệu/m²
- Căn hộ 1PN: 1.6 - 3.4 tỷ
- Căn hộ 2PN: 2.8 - 3.5 tỷ
- Căn hộ 3PN: 3.5 - 4.6 tỷ

**Giá cho thuê:**
- Từ 11.5 - 18 triệu/tháng
- Căn hộ 2PN: 11 - 16 triệu/tháng
- Căn hộ 3PN: 14 - 20 triệu/tháng`,
                amenities: `**Tiện ích nội khu:**
- Hồ bơi vô cực
- Phòng gym hiện đại
- Khu vui chơi trẻ em
- Công viên cây xanh
- Khu BBQ
- Sân thể thao đa năng

**Tiện ích ngoại khu:**
- TTTM SC Vivocity với các thương hiệu: McDonald's, Starbucks, Chanel, Hermes
- Siêu thị Lotte Mart, CoopXtra, Parkson Paragon
- Rạp chiếu phim Lotte
- Nhà sách Fahasa
- Sân golf 36 lỗ
- Đại học quốc tế RMIT
- Ngân hàng và cơ quan hành chính`,
                openDate: new Date('2020-01-01'),
                commissionRate: 2.0,
                createdBy: creator.id
            }
        });

        console.log('✅ Created project:', project.name);

        // Create 8 buildings with total 2,200 units
        // Distribution: ~275 units per building
        const buildingNames = [
            { code: 'E1', name: 'Tòa E1', floors: 25, unitsPerFloor: 11 },  // 275 units
            { code: 'E2', name: 'Tòa E2', floors: 25, unitsPerFloor: 11 },  // 275 units
            { code: 'G1', name: 'Tòa G1', floors: 25, unitsPerFloor: 11 },  // 275 units
            { code: 'G2', name: 'Tòa G2', floors: 25, unitsPerFloor: 11 },  // 275 units
            { code: 'G3', name: 'Tòa G3', floors: 25, unitsPerFloor: 11 },  // 275 units
            { code: 'G4', name: 'Tòa G4', floors: 25, unitsPerFloor: 11 },  // 275 units
            { code: 'G5', name: 'Tòa G5', floors: 25, unitsPerFloor: 11 },  // 275 units
            { code: 'G6', name: 'Tòa G6', floors: 25, unitsPerFloor: 11 }   // 275 units
        ];
        // Total: 8 buildings × 25 floors × 11 units = 2,200 units

        let totalUnitsCreated = 0;

        for (const buildingInfo of buildingNames) {
            console.log(`\n📦 Creating ${buildingInfo.name}...`);

            const building = await prisma.building.create({
                data: {
                    projectId: project.id,
                    code: buildingInfo.code,
                    name: buildingInfo.name,
                    floors: buildingInfo.floors,
                    description: `${buildingInfo.name} - Sunrise Riverside`
                }
            });

            console.log(`✅ Created building: ${building.name}`);

            // Create floors and units for this building
            for (let floorNum = 1; floorNum <= buildingInfo.floors; floorNum++) {
                // Create floor
                const floor = await prisma.floor.create({
                    data: {
                        buildingId: building.id,
                        number: floorNum
                    }
                });

                // Create units for this floor
                const unitsToCreate = [];
                for (let unitNum = 1; unitNum <= buildingInfo.unitsPerFloor; unitNum++) {
                    const unitNumber = `${String(floorNum).padStart(2, '0')}${String(unitNum).padStart(2, '0')}`;
                    const unitCode = `${buildingInfo.code}-${unitNumber}`;

                    // Randomly assign bedroom count (1-3)
                    const bedrooms = Math.floor(Math.random() * 3) + 1;
                    const bathrooms = bedrooms === 1 ? 1 : bedrooms === 2 ? 2 : 2;

                    // Calculate area and price based on bedrooms
                    let area, price;
                    if (bedrooms === 1) {
                        area = 45 + Math.random() * 20; // 45-65 m²
                        price = 1600000000 + Math.random() * 1800000000; // 1.6-3.4 tỷ
                    } else if (bedrooms === 2) {
                        area = 65 + Math.random() * 25; // 65-90 m²
                        price = 2800000000 + Math.random() * 700000000; // 2.8-3.5 tỷ
                    } else {
                        area = 90 + Math.random() * 30; // 90-120 m²
                        price = 3500000000 + Math.random() * 1100000000; // 3.5-4.6 tỷ
                    }

                    // Random direction
                    const directions = ['Đông', 'Tây', 'Nam', 'Bắc', 'Đông Nam', 'Đông Bắc', 'Tây Nam', 'Tây Bắc'];
                    const direction = directions[Math.floor(Math.random() * directions.length)];

                    // Random view
                    const views = ['View sông', 'View thành phố', 'View công viên', 'View nội khu'];
                    const view = views[Math.floor(Math.random() * views.length)];

                    unitsToCreate.push({
                        projectId: project.id,
                        buildingId: building.id,
                        floorId: floor.id,
                        code: unitCode,
                        unitNumber: unitNumber,
                        status: 'AVAILABLE',
                        price: Math.round(price),
                        area: Math.round(area * 10) / 10,
                        bedrooms: bedrooms,
                        bathrooms: bathrooms,
                        direction: direction,
                        balcony: true,
                        view: view,
                        description: `Căn hộ ${bedrooms} phòng ngủ, ${bathrooms} phòng tắm, diện tích ${Math.round(area)}m², ${direction}, ${view}`,
                        commissionRate: 2.0
                    });
                }

                // Batch create units for this floor
                await prisma.unit.createMany({
                    data: unitsToCreate
                });

                totalUnitsCreated += unitsToCreate.length;
            }

            console.log(`   ✅ Created ${buildingInfo.floors} floors with ${buildingInfo.floors * buildingInfo.unitsPerFloor} units`);
        }

        console.log('\n🎉 Successfully created Sunrise Riverside project!');
        console.log(`   📊 Total buildings: ${buildingNames.length}`);
        console.log(`   📊 Total units created: ${totalUnitsCreated}`);
        console.log(`   🏢 Project code: ${project.code}`);
        console.log(`   🏗️  Developer: ${project.developer}`);
        console.log(`   📍 Location: ${project.address}`);

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

seedSunriseRiverside();

const { PrismaClient } = require('../lib/generated/prisma');

const prisma = new PrismaClient();

async function replaceProject() {
    try {
        console.log('🗑️  Deleting Lê Văn Thiêm Luxury project...');

        // Delete old project
        const oldProject = await prisma.project.findFirst({
            where: { 
                OR: [
                    { code: 'LVT-LUXURY' },
                    { name: { contains: 'Lê Văn Thiêm' } }
                ]
            }
        });

        if (oldProject) {
            await prisma.project.delete({
                where: { id: oldProject.id }
            });
            console.log('✅ Deleted:', oldProject.name);
        } else {
            console.log('ℹ️  Project not found');
        }

        console.log('\n🏢 Creating Masteri Thảo Điền project...');

        // Find creator
        const creator = await prisma.user.findFirst();
        if (!creator) {
            console.error('❌ No user found to create project');
            return;
        }

        // Create new project
        const project = await prisma.project.create({
            data: {
                name: 'Masteri Thảo Điền',
                code: 'MASTERI-THAO-DIEN',
                status: 'OPEN',
                developer: 'Masterise Homes',
                location: 'Thảo Điền, Quận 2',
                address: '165 Xa lộ Hà Nội, Thảo Điền, Quận 2',
                district: 'Quận 2',
                city: 'Hồ Chí Minh',
                latitude: 10.8067,
                longitude: 106.7413,
                totalArea: 79800, // 7.98 ha
                totalBuildings: 5,
                totalUnits: 3021,
                priceFrom: 3100000000, // 3.1 tỷ
                priceTo: 20000000000, // 20 tỷ
                description: `Căn hộ Masteri Thảo Điền tọa lạc tại số 165 Xa lộ Hà Nội, Thảo Điền, Quận 2, Tp.HCM. Đây là một vị trí đắc địa, kết nối trực tiếp với các tuyến giao thông huyết mạch của thành phố.

**Thông tin dự án:**
- Diện tích: 7,98 ha
- Số tòa: 5 tòa (T1, T2, T3, T4, T5)
- Số căn hộ: 3.021 căn
- Chủ đầu tư: Masterise Homes

**Vị trí:**
Tọa lạc ngay tại trung tâm Thảo Điền, quận 2, tiếp giáp mặt tiền xa lộ Hà Nội và kết nối trực tiếp với ga An Phú (ga số 7) của tuyến tàu điện Metro đô thị số 1 Bến Thành – Suối Tiên.

**Giá bán:**
- Giá: 92,39 - 134,62 triệu/m²
- Căn hộ 1PN: 3,1 - 3,x tỷ (46-55m²)
- Căn hộ 2PN: 4 - 5,x tỷ (64-78m²)
- Căn hộ 3PN: 5,8 - 7,x tỷ (92-103m²)
- Duplex/Penthouse: 10 - 2x tỷ (137-352m²)

**Giá cho thuê:**
- 1PN: 14 - 18 triệu/tháng
- 2PN: 15 - 25 triệu/tháng
- 3PN: 23 - 48 triệu/tháng`,
                amenities: `**Tiện ích nội khu:**
- Mật độ cây xanh: 60%
- Hồ bơi vô cực
- Phòng gym hiện đại
- Khu vui chơi trẻ em
- Công viên cây xanh
- Khu BBQ
- Sân thể thao đa năng
- Khu thương mại
- Nhà hàng, cafe

**Tiện ích ngoại khu:**
- Kết nối ga Metro An Phú
- Gần trường quốc tế
- Gần bệnh viện
- Trung tâm thương mại
- Khu ẩm thực Thảo Điền`,
                images: '/images/projects/masteri_thaodien_0.png,/images/projects/masteri_thaodien_1.webp,/images/projects/masteri_thaodien_2.webp,/images/projects/masteri_thaodien_3.png,/images/projects/masteri_thaodien_4.jpg,/images/projects/masteri_thaodien_5.jpg,/images/projects/masteri_thaodien_6.jpg,/images/projects/masteri_thaodien_7.jpg,/images/projects/masteri_thaodien_8.jpg,/images/projects/masteri_thaodien_9.jpg',
                openDate: new Date('2018-01-01'),
                commissionRate: 2.0,
                createdBy: creator.id
            }
        });

        console.log('✅ Created project:', project.name);

        // Create 5 buildings
        const buildingNames = [
            { code: 'T1', name: 'Tòa T1', floors: 35, unitsPerFloor: 17 },  // 595 units
            { code: 'T2', name: 'Tòa T2', floors: 35, unitsPerFloor: 17 },  // 595 units
            { code: 'T3', name: 'Tòa T3', floors: 35, unitsPerFloor: 17 },  // 595 units
            { code: 'T4', name: 'Tòa T4', floors: 35, unitsPerFloor: 18 },  // 630 units
            { code: 'T5', name: 'Tòa T5', floors: 35, unitsPerFloor: 18 }   // 630 units
        ];
        // Total: ~3,045 units (close to 3,021)

        let totalUnitsCreated = 0;

        for (const buildingInfo of buildingNames) {
            console.log(`\n📦 Creating ${buildingInfo.name}...`);

            const building = await prisma.building.create({
                data: {
                    projectId: project.id,
                    code: buildingInfo.code,
                    name: buildingInfo.name,
                    floors: buildingInfo.floors,
                    description: `${buildingInfo.name} - Masteri Thảo Điền`
                }
            });

            // Create floors and units
            for (let floorNum = 1; floorNum <= buildingInfo.floors; floorNum++) {
                const floor = await prisma.floor.create({
                    data: {
                        buildingId: building.id,
                        number: floorNum
                    }
                });

                const unitsToCreate = [];
                for (let unitNum = 1; unitNum <= buildingInfo.unitsPerFloor; unitNum++) {
                    const unitNumber = `${String(floorNum).padStart(2, '0')}${String(unitNum).padStart(2, '0')}`;
                    const unitCode = `${buildingInfo.code}-${unitNumber}`;

                    // Randomly assign bedroom count (1-3, with some duplex)
                    const random = Math.random();
                    let bedrooms, bathrooms, area, price;
                    
                    if (random < 0.25) { // 25% - 1 bedroom
                        bedrooms = 1;
                        bathrooms = 1;
                        area = 46 + Math.random() * 9; // 46-55 m²
                        price = 3100000000 + Math.random() * 900000000; // 3.1-4 tỷ
                    } else if (random < 0.60) { // 35% - 2 bedrooms
                        bedrooms = 2;
                        bathrooms = 2;
                        area = 64 + Math.random() * 14; // 64-78 m²
                        price = 4000000000 + Math.random() * 1500000000; // 4-5.5 tỷ
                    } else if (random < 0.90) { // 30% - 3 bedrooms
                        bedrooms = 3;
                        bathrooms = 2;
                        area = 92 + Math.random() * 11; // 92-103 m²
                        price = 5800000000 + Math.random() * 1700000000; // 5.8-7.5 tỷ
                    } else { // 10% - Duplex/Penthouse
                        bedrooms = 4;
                        bathrooms = 3;
                        area = 137 + Math.random() * 100; // 137-237 m²
                        price = 10000000000 + Math.random() * 10000000000; // 10-20 tỷ
                    }

                    const directions = ['Đông', 'Tây', 'Nam', 'Bắc', 'Đông Nam', 'Đông Bắc', 'Tây Nam', 'Tây Bắc'];
                    const direction = directions[Math.floor(Math.random() * directions.length)];

                    const views = ['View sông Sài Gòn', 'View thành phố', 'View công viên', 'View nội khu'];
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

                await prisma.unit.createMany({
                    data: unitsToCreate
                });

                totalUnitsCreated += unitsToCreate.length;
            }

            console.log(`   ✅ Created ${buildingInfo.floors} floors with ${buildingInfo.floors * buildingInfo.unitsPerFloor} units`);
        }

        console.log('\n🎉 Successfully created Masteri Thảo Điền project!');
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

replaceProject();

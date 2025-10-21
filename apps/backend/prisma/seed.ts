/**
 * Simplified Database Seed
 * Matches actual Prisma schema
 */

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...\n');

  // 1. Users
  console.log('👥 Creating Users...');
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@batdongsan.com' },
    update: {},
    create: {
      email: 'admin@batdongsan.com',
      password: adminPassword,
      fullName: 'Admin User',
      phone: '0901234567',
      role: 'ADMIN',
      isActive: true,
    },
  });
  console.log('✅ Admin:', admin.email);

  // Create CTVs
  const ctvs = [];
  for (let i = 1; i <= 3; i++) {
    const ctvPassword = await bcrypt.hash('ctv123', 10);
    const ctv = await prisma.user.upsert({
      where: { phone: `091234567${i}` },
      update: {},
      create: {
        phone: `091234567${i}`,
        email: `ctv${i}@batdongsan.com`,
        password: ctvPassword,
        fullName: `CTV User ${i}`,
        role: 'CTV',
        isActive: true,
      },
    });
    ctvs.push(ctv);
    console.log(`✅ CTV ${i}:`, ctv.phone);
  }

  // 2. Unit Types
  console.log('\n🏠 Creating Unit Types...');
  const unitTypes = [
    { name: 'Studio', code: 'STUDIO' },
    { name: '1 Phòng ngủ', code: '1BR' },
    { name: '2 Phòng ngủ', code: '2BR' },
  ];
  for (const type of unitTypes) {
    await prisma.unitType.upsert({
      where: { code: type.code },
      update: {},
      create: type,
    });
  }
  console.log('✅ Created 3 Unit Types');

  // 3. Project (OPEN status)
  console.log('\n🏗️  Creating Project...');
  const project = await prisma.project.upsert({
    where: { code: 'VHS-2025' },
    update: {},
    create: {
      name: 'Vinhomes Smart City',
      code: 'VHS-2025',
      status: 'OPEN',
      developer: 'Vingroup',
      location: 'Nam Từ Liêm, Hà Nội',
      address: 'Đại lộ Thăng Long',
      district: 'Nam Từ Liêm',
      city: 'Hà Nội',
      totalBuildings: 2,
      totalUnits: 100,
      priceFrom: 2000000000,
      priceTo: 5000000000,
      description: 'Dự án căn hộ cao cấp',
      commissionRate: 2.5,
      openDate: new Date('2025-01-01'),
      createdBy: admin.id,
    },
  });
  console.log('✅ Project:', project.name);

  // 4. Buildings & Floors - FIXED: Using upsert instead of create
  console.log('\n🏢 Creating Buildings...');
  const buildings = [];
  for (let i = 1; i <= 2; i++) {
    const building = await prisma.building.upsert({
      where: {
        projectId_code: {
          projectId: project.id,
          code: `A${i}`,
        },
      },
      update: {},
      create: {
        projectId: project.id,
        code: `A${i}`,
        name: `Tòa A${i}`,
        floors: 15,
      },
    });
    buildings.push(building);

    // Create floors - FIXED: Using upsert for floors as well
    for (let f = 5; f <= 10; f++) {
      await prisma.floor.upsert({
        where: {
          buildingId_number: {
            buildingId: building.id,
            number: f,
          },
        },
        update: {},
        create: {
          buildingId: building.id,
          number: f,
        },
      });
    }
  }
  console.log('✅ Created 2 Buildings');

  // 5. Units - FIXED: Using upsert for units
  console.log('\n🏘️  Creating Units...');
  let unitCount = 0;
  for (const building of buildings) {
    const floors = await prisma.floor.findMany({
      where: { buildingId: building.id },
      orderBy: { number: 'asc' }
    });

    for (const floor of floors) {
      for (let u = 1; u <= 3; u++) {
        const code = `${building.code}-${floor.number}${u.toString().padStart(2, '0')}`;
        await prisma.unit.upsert({
          where: {
              projectId: project.id,
              code: code,
          },
          update: {},
          create: {
            projectId: project.id,
            buildingId: building.id,
            floorId: floor.id,
            code,
            unitNumber: `${floor.number}${u.toString().padStart(2, '0')}`,
            status: 'AVAILABLE',
            price: 2500000000,
            area: 75,
            bedrooms: 2,
            bathrooms: 2,
            direction: 'Đông',
            balcony: true,
          },
        });
        unitCount++;
      }
    }
  }
  console.log(`✅ Created ${unitCount} Units`);

  // 6. System Configs
  console.log('\n⚙️  Creating System Configs...');
  const configs = [
    { key: 'BOOKING_DURATION', value: '24', type: 'number', label: 'Thời gian giữ chỗ (giờ)', category: 'booking' },
    { key: 'COMMISSION_RATE', value: '2.5', type: 'number', label: 'Hoa hồng mặc định (%)', category: 'commission' },
  ];
  for (const config of configs) {
    await prisma.systemConfig.upsert({
      where: { key: config.key },
      update: {},
      create: config,
    });
  }
  console.log('✅ Created System Configs');

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎉 SEED COMPLETED!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('📊 Summary:');
  console.log(`   - Users: ${1 + ctvs.length}`);
  console.log(`   - Project: 1`);
  console.log(`   - Buildings: 2`);
  console.log(`   - Units: ${unitCount}`);
  console.log('\n🔐 Login:');
  console.log('   Admin: admin@batdongsan.com / admin123');
  console.log('   CTV 1: ctv1@batdongsan.com / ctv123');
  console.log('   CTV 2: ctv2@batdongsan.com / ctv123');
  console.log('   CTV 3: ctv3@batdongsan.com / ctv123\n');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
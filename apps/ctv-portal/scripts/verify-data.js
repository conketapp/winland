/**
 * Verify Script: Check "Lê Văn Thiêm Luxury" Project Data
 * Run: node scripts/verify-data.js
 */

const { PrismaClient } = require('../lib/generated/prisma');
const prisma = new PrismaClient();

async function main() {
    console.log('🔍 Verifying database data...\n');

    // Check Project
    const project = await prisma.project.findFirst({
        where: { code: 'LVT-LUXURY' },
        include: {
            buildings: {
                include: {
                    units: true
                }
            }
        }
    });

    if (!project) {
        console.log('❌ Project not found!');
        console.log('Run: node scripts/seed-project.js');
        return;
    }

    console.log('✅ Project Found:');
    console.log(`   Name: ${project.name}`);
    console.log(`   Code: ${project.code}`);
    console.log(`   Status: ${project.status}`);
    console.log(`   Location: ${project.location}`);
    console.log(`   Price Range: ${(project.priceFrom / 1000000000).toFixed(1)}B - ${(project.priceTo / 1000000000).toFixed(1)}B VND`);
    console.log(`   Commission Rate: ${project.commissionRate}%\n`);

    // Check Buildings
    console.log(`🏢 Buildings: ${project.buildings.length}`);
    project.buildings.forEach(building => {
        console.log(`   - ${building.name} (${building.code}): ${building.units.length} units`);
    });
    console.log('');

    // Check Units by Status
    const allUnits = project.buildings.flatMap(b => b.units);
    const statusCounts = {
        AVAILABLE: 0,
        RESERVED_BOOKING: 0,
        DEPOSITED: 0,
        SOLD: 0
    };

    allUnits.forEach(unit => {
        statusCounts[unit.status]++;
    });

    console.log(`🏠 Total Units: ${allUnits.length}`);
    console.log(`   Status Breakdown:`);
    console.log(`   - AVAILABLE (Đang mở bán): ${statusCounts.AVAILABLE}`);
    console.log(`   - RESERVED_BOOKING (Đang có đặt chỗ): ${statusCounts.RESERVED_BOOKING}`);
    console.log(`   - DEPOSITED (Đã cọc tiền): ${statusCounts.DEPOSITED}`);
    console.log(`   - SOLD (Đã bán): ${statusCounts.SOLD}\n`);

    // Sample Units
    console.log('📋 Sample Units:');
    const sampleUnits = allUnits.slice(0, 5);
    sampleUnits.forEach(unit => {
        console.log(`   ${unit.code}:`);
        console.log(`      Area: ${unit.area}m²`);
        console.log(`      Price: ${(unit.price / 1000000000).toFixed(2)}B VND`);
        console.log(`      Bedrooms: ${unit.bedrooms}, Bathrooms: ${unit.bathrooms}`);
        console.log(`      Direction: ${unit.direction}, View: ${unit.view}`);
        console.log(`      Status: ${unit.status}`);
        console.log('');
    });

    console.log('✨ Verification complete!');
    console.log('\n📱 Next Steps:');
    console.log('   1. Start dev server: npm run dev');
    console.log('   2. Login to the app');
    console.log('   3. Go to "Quản lý dự án" (Project Management)');
    console.log('   4. You should see "Lê Văn Thiêm Luxury" with all units');
}

main()
    .catch((e) => {
        console.error('❌ Error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

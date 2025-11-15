const { PrismaClient } = require('../lib/generated/prisma');

const prisma = new PrismaClient();

async function verifyHouseCertificates() {
  try {
    console.log('🔍 Verifying house certificates...\n');

    // Get sample units with certificates
    const sampleUnits = await prisma.unit.findMany({
      take: 10,
      select: {
        code: true,
        houseCertificate: true,
        project: {
          select: {
            name: true
          }
        }
      }
    });

    console.log('📋 Sample Units with Certificates:');
    sampleUnits.forEach(unit => {
      console.log(`   ${unit.code} (${unit.project.name}): ${unit.houseCertificate}`);
    });

    // Get distribution
    const distribution = await prisma.unit.groupBy({
      by: ['houseCertificate'],
      _count: true
    });

    console.log('\n📊 Certificate Distribution:');
    distribution.forEach(item => {
      console.log(`   ${item.houseCertificate}: ${item._count} units`);
    });

    // Check for null values
    const nullCount = await prisma.unit.count({
      where: {
        houseCertificate: null
      }
    });

    console.log(`\n⚠️  Units without certificate: ${nullCount}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyHouseCertificates();

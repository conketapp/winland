const { PrismaClient } = require('../lib/generated/prisma');

const prisma = new PrismaClient();

const certificates = [
  "Sổ đỏ",
  "Hợp đồng mua bán nhà ở",
  "Biên bản nghiệm thu"
];

function getRandomCertificate() {
  return certificates[Math.floor(Math.random() * certificates.length)];
}

async function updateHouseCertificates() {
  try {
    console.log('🔄 Starting to update house certificates...');

    // Get all units
    const units = await prisma.unit.findMany({
      select: { id: true, code: true }
    });

    console.log(`📊 Found ${units.length} units to update`);

    // Update each unit with a random certificate
    let updated = 0;
    for (const unit of units) {
      const certificate = getRandomCertificate();
      await prisma.unit.update({
        where: { id: unit.id },
        data: { houseCertificate: certificate }
      });
      updated++;
      
      if (updated % 100 === 0) {
        console.log(`✅ Updated ${updated}/${units.length} units...`);
      }
    }

    console.log(`✅ Successfully updated ${updated} units with house certificates`);
    
    // Show distribution
    const distribution = await prisma.unit.groupBy({
      by: ['houseCertificate'],
      _count: true
    });
    
    console.log('\n📊 Certificate Distribution:');
    distribution.forEach(item => {
      console.log(`   ${item.houseCertificate}: ${item._count} units`);
    });

  } catch (error) {
    console.error('❌ Error updating house certificates:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

updateHouseCertificates();

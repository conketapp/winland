const { PrismaClient } = require('../lib/generated/prisma');

const prisma = new PrismaClient();

async function checkBookingUnitData() {
  try {
    console.log('🔍 Checking booking unit data...\n');

    const booking = await prisma.booking.findFirst({
      include: {
        unit: {
          include: {
            project: {
              select: {
                name: true,
                code: true
              }
            },
            building: {
              select: {
                name: true,
                code: true
              }
            },
            floor: {
              select: {
                number: true
              }
            }
          }
        }
      }
    });

    if (!booking) {
      console.log('❌ No bookings found');
      return;
    }

    console.log('📋 Booking:', booking.code);
    console.log('\n🏢 Unit Data:');
    console.log('  Code:', booking.unit?.code);
    console.log('  Price:', booking.unit?.price);
    console.log('  Area:', booking.unit?.area);
    console.log('  Bedrooms:', booking.unit?.bedrooms);
    console.log('  Bathrooms:', booking.unit?.bathrooms);
    console.log('  Direction:', booking.unit?.direction);
    console.log('  View:', booking.unit?.view);
    console.log('  Description:', booking.unit?.description?.substring(0, 50) + '...');
    console.log('  Images:', booking.unit?.images ? 'Yes' : 'No');
    console.log('  House Certificate:', booking.unit?.houseCertificate);
    console.log('\n🏗️ Related Data:');
    console.log('  Project:', booking.unit?.project?.name);
    console.log('  Building:', booking.unit?.building?.name);
    console.log('  Floor:', booking.unit?.floor?.number);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkBookingUnitData();

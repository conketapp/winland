const { PrismaClient } = require('../lib/generated/prisma');

const prisma = new PrismaClient();

async function checkBookingSchedule() {
  try {
    console.log('🔍 Checking booking visit schedules...\n');

    // Get recent bookings
    const bookings = await prisma.booking.findMany({
      take: 5,
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        code: true,
        customerName: true,
        visitDate: true,
        visitStartTime: true,
        visitEndTime: true,
        notes: true,
        createdAt: true
      }
    });

    if (bookings.length === 0) {
      console.log('❌ No bookings found');
      return;
    }

    console.log(`📋 Found ${bookings.length} recent bookings:\n`);
    
    bookings.forEach((booking, index) => {
      console.log(`${index + 1}. ${booking.code} - ${booking.customerName}`);
      console.log(`   Visit Date: ${booking.visitDate || 'NULL'}`);
      console.log(`   Start Time: ${booking.visitStartTime || 'NULL'}`);
      console.log(`   End Time: ${booking.visitEndTime || 'NULL'}`);
      console.log(`   Notes: ${booking.notes || 'NULL'}`);
      console.log(`   Created: ${booking.createdAt}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkBookingSchedule();

const { PrismaClient } = require('../lib/generated/prisma');

const prisma = new PrismaClient();

async function testBookingsAPI() {
  try {
    console.log('🔍 Testing bookings API query...\n');

    // Find a user first
    const user = await prisma.user.findFirst();
    
    if (!user) {
      console.log('❌ No users found');
      return;
    }

    console.log('👤 Testing with user:', user.fullName);

    // Simulate the API query
    const bookings = await prisma.booking.findMany({
      where: {
        ctvId: user.id
      },
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
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 1
    });

    if (bookings.length === 0) {
      console.log('❌ No bookings found for this user');
      return;
    }

    const booking = bookings[0];
    console.log('\n📋 Booking Code:', booking.code);
    console.log('\n🏢 Unit Object Keys:', Object.keys(booking.unit || {}));
    console.log('\n📊 Full Unit Data:');
    console.log(JSON.stringify(booking.unit, null, 2));

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testBookingsAPI();

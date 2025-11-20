/**
 * Script to verify test data setup
 */

const { PrismaClient } = require('../lib/generated/prisma');

const prisma = new PrismaClient();

async function main() {
    console.log('🔍 Verifying test data setup...\n');

    try {
        // Check units
        console.log('📦 Units Status:');
        const units = await prisma.unit.findMany({
            where: {
                code: {
                    in: ['T1-0104', 'T1-0106']
                }
            },
            include: {
                project: true
            }
        });

        units.forEach(unit => {
            console.log(`   ${unit.code}: ${unit.status} (${unit.project.name})`);
        });

        // Check expired booking
        console.log('\n📅 Expired Booking:');
        const expiredBooking = await prisma.booking.findFirst({
            where: {
                status: 'EXPIRED',
                unitId: units[0]?.id
            },
            include: {
                unit: true,
                ctv: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        if (expiredBooking) {
            console.log(`   Code: ${expiredBooking.code}`);
            console.log(`   Status: ${expiredBooking.status}`);
            console.log(`   Unit: ${expiredBooking.unit.code}`);
            console.log(`   Customer: ${expiredBooking.customerName}`);
            console.log(`   Phone: ${expiredBooking.customerPhone}`);
            console.log(`   Visit Date: ${expiredBooking.visitDate}`);
            console.log(`   Visit Time: ${expiredBooking.visitStartTime} - ${expiredBooking.visitEndTime}`);
            console.log(`   Expired At: ${expiredBooking.expiresAt.toLocaleString('vi-VN')}`);
            console.log(`   Hidden: ${expiredBooking.notes?.includes('[HIDDEN_FROM_DASHBOARD]') ? 'Yes' : 'No'}`);
        } else {
            console.log('   No expired booking found');
        }

        // Check all bookings count
        console.log('\n📊 Booking Statistics:');
        const totalBookings = await prisma.booking.count();
        const expiredBookings = await prisma.booking.count({
            where: { status: 'EXPIRED' }
        });
        const hiddenBookings = await prisma.booking.count({
            where: {
                notes: {
                    contains: '[HIDDEN_FROM_DASHBOARD]'
                }
            }
        });

        console.log(`   Total Bookings: ${totalBookings}`);
        console.log(`   Expired Bookings: ${expiredBookings}`);
        console.log(`   Hidden Bookings: ${hiddenBookings}`);
        console.log(`   Next Booking ID: BK${String(totalBookings + 1).padStart(6, '0')}`);

        console.log('\n✅ Verification complete!\n');

    } catch (error) {
        console.error('❌ Error:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

main()
    .catch((error) => {
        console.error('Fatal error:', error);
        process.exit(1);
    });

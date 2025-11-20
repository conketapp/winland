/**
 * Script to prepare test data for booking expiry feature
 * 
 * This script will:
 * 1. Find units T1-0104 and T1-0106
 * 2. Cancel any active reservations on these units
 * 3. Set units to AVAILABLE status
 * 4. Create a new EXPIRED booking for testing
 */

const { PrismaClient } = require('../lib/generated/prisma');

const prisma = new PrismaClient();

async function main() {
    console.log('🚀 Starting test data preparation...\n');

    try {
        // Step 1: Find units T1-0104 and T1-0106
        console.log('📋 Step 1: Finding units T1-0104 and T1-0106...');
        const units = await prisma.unit.findMany({
            where: {
                code: {
                    in: ['T1-0104', 'T1-0106']
                }
            },
            include: {
                project: true,
                building: true,
                floor: true
            }
        });

        if (units.length === 0) {
            console.log('❌ No units found with codes T1-0104 or T1-0106');
            return;
        }

        console.log(`✅ Found ${units.length} unit(s):`);
        units.forEach(unit => {
            console.log(`   - ${unit.code} (${unit.project.name}) - Current status: ${unit.status}`);
        });

        // Step 2: Cancel active reservations on these units
        console.log('\n📋 Step 2: Cancelling active reservations...');
        for (const unit of units) {
            const activeReservations = await prisma.reservation.findMany({
                where: {
                    unitId: unit.id,
                    status: {
                        in: ['ACTIVE', 'YOUR_TURN']
                    }
                }
            });

            if (activeReservations.length > 0) {
                console.log(`   Found ${activeReservations.length} active reservation(s) on ${unit.code}`);
                
                for (const reservation of activeReservations) {
                    await prisma.reservation.update({
                        where: { id: reservation.id },
                        data: {
                            status: 'CANCELLED',
                            cancelledReason: 'Cancelled for testing booking expiry feature'
                        }
                    });
                    console.log(`   ✅ Cancelled reservation ${reservation.code}`);
                }
            } else {
                console.log(`   No active reservations on ${unit.code}`);
            }
        }

        // Step 3: Set units to AVAILABLE
        console.log('\n📋 Step 3: Setting units to AVAILABLE status...');
        for (const unit of units) {
            await prisma.unit.update({
                where: { id: unit.id },
                data: { status: 'AVAILABLE' }
            });
            console.log(`   ✅ Unit ${unit.code} set to AVAILABLE`);
        }

        // Step 4: Create EXPIRED booking for testing
        console.log('\n📋 Step 4: Creating EXPIRED booking for testing...');
        
        // Get the first available unit
        const testUnit = units[0];
        
        // Get current user (first CTV user)
        const ctvUser = await prisma.user.findFirst({
            where: { role: 'CTV' }
        });

        if (!ctvUser) {
            console.log('❌ No CTV user found. Please create a user first.');
            return;
        }

        // Generate booking code
        const bookingCount = await prisma.booking.count();
        const bookingCode = `BK${String(bookingCount + 1).padStart(6, '0')}`;

        // Create booking with past visit time (already expired)
        const now = new Date();
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        
        const visitDate = yesterday.toISOString().split('T')[0]; // Yesterday's date
        const visitStartTime = '14:00';
        const visitEndTime = '15:00';
        
        // Expiry time is visitEndTime + 30 minutes (already passed)
        const expiresAt = new Date(`${visitDate}T${visitEndTime}`);
        expiresAt.setMinutes(expiresAt.getMinutes() + 30);

        const booking = await prisma.booking.create({
            data: {
                code: bookingCode,
                unitId: testUnit.id,
                ctvId: ctvUser.id,
                customerName: 'Test Customer - Expired Booking',
                customerPhone: '0901234567',
                customerEmail: 'test.expired@example.com',
                bookingAmount: 0,
                paymentMethod: 'NONE',
                status: 'EXPIRED', // Set directly to EXPIRED for testing
                expiresAt: expiresAt,
                visitDate: visitDate,
                visitStartTime: visitStartTime,
                visitEndTime: visitEndTime,
                notes: `Lịch xem nhà: ${visitDate} từ ${visitStartTime} đến ${visitEndTime}\n[TEST DATA - Created for testing booking expiry feature]`,
                cancelledReason: 'Đã qua thời gian booking',
                approvedAt: yesterday
            }
        });

        // Update unit status to RESERVED_BOOKING (simulating expired booking state)
        await prisma.unit.update({
            where: { id: testUnit.id },
            data: { status: 'RESERVED_BOOKING' }
        });

        console.log(`   ✅ Created EXPIRED booking ${bookingCode} on unit ${testUnit.code}`);
        console.log(`   📅 Visit date: ${visitDate} ${visitStartTime}-${visitEndTime}`);
        console.log(`   ⏰ Expired at: ${expiresAt.toLocaleString('vi-VN')}`);
        console.log(`   👤 Customer: ${booking.customerName}`);
        console.log(`   📱 Phone: ${booking.customerPhone}`);

        // Summary
        console.log('\n✅ Test data preparation completed!\n');
        console.log('📊 Summary:');
        console.log(`   - Units set to AVAILABLE: ${units.length}`);
        console.log(`   - EXPIRED booking created: ${bookingCode}`);
        console.log(`   - Unit ${testUnit.code} status: RESERVED_BOOKING (with expired booking)`);
        console.log('\n🧪 Next steps:');
        console.log('   1. Open the dashboard');
        console.log('   2. You should see the expired booking with "Hết hạn" badge');
        console.log('   3. Click the Trash button (🗑️) to test deletion');
        console.log('   4. Verify unit returns to AVAILABLE status');
        console.log('   5. Check transaction history to see booking is preserved\n');

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

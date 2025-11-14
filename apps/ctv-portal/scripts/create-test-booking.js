const { PrismaClient } = require('../lib/generated/prisma');

const prisma = new PrismaClient();

async function createTestBooking() {
    try {
        console.log('🔍 Finding unit LK1-0503...');
        
        // Find the unit
        const unit = await prisma.unit.findUnique({
            where: { code: 'LK1-0503' }
        });

        if (!unit) {
            console.error('❌ Unit LK1-0503 not found!');
            return;
        }

        console.log('✅ Found unit:', unit.code);

        // Find a CTV user
        const ctv = await prisma.user.findFirst({
            where: { role: 'CTV' }
        });

        if (!ctv) {
            console.error('❌ No CTV user found!');
            return;
        }

        console.log('✅ Found CTV:', ctv.fullName);

        // Check if unit already has an active booking
        const existingBooking = await prisma.booking.findFirst({
            where: {
                unitId: unit.id,
                status: {
                    in: ['PENDING_APPROVAL', 'CONFIRMED', 'PENDING_PAYMENT']
                }
            }
        });

        if (existingBooking) {
            console.log('ℹ️  Unit already has an active booking:', existingBooking.code);
            console.log('   Status:', existingBooking.status);
            return;
        }

        // Generate booking code
        const now = new Date();
        const year = now.getFullYear().toString().slice(-2);
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hour = String(now.getHours()).padStart(2, '0');
        const minute = String(now.getMinutes()).padStart(2, '0');
        const second = String(now.getSeconds()).padStart(2, '0');
        const bookingCode = `BK${year}${month}${day}${hour}${minute}${second}`;

        // Create booking
        const booking = await prisma.booking.create({
            data: {
                code: bookingCode,
                unitId: unit.id,
                ctvId: ctv.id,
                customerName: 'Nguyễn Văn Test',
                customerPhone: '0901234567',
                customerEmail: 'test@example.com',
                customerIdCard: '001234567890',
                customerAddress: '123 Test Street, District 1, Ho Chi Minh City',
                bookingAmount: 50000000, // 50 million VND
                paymentMethod: 'BANK_TRANSFER',
                status: 'CONFIRMED', // Set as CONFIRMED so it shows as active
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Expires in 7 days
                notes: 'Test booking for UI verification'
            }
        });

        console.log('✅ Created booking:', booking.code);
        console.log('   Unit:', unit.code);
        console.log('   Status:', booking.status);
        console.log('   Customer:', booking.customerName);
        console.log('   Amount:', booking.bookingAmount.toLocaleString('vi-VN'), 'VND');

        // Update unit status to RESERVED_BOOKING
        await prisma.unit.update({
            where: { id: unit.id },
            data: { status: 'RESERVED_BOOKING' }
        });

        console.log('✅ Updated unit status to RESERVED_BOOKING');
        console.log('\n🎉 Done! Unit LK1-0503 should now show as "Đang có booking" in the UI');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createTestBooking();

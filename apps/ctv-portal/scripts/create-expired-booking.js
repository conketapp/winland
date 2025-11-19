const { PrismaClient } = require('../lib/generated/prisma');

const prisma = new PrismaClient();

async function createExpiredBooking() {
    try {
        console.log('🔍 Tìm user "Trần Quang Vũ"...');
        
        // Find user by name
        const user = await prisma.user.findFirst({
            where: {
                fullName: {
                    contains: 'Trần Quang Vũ'
                }
            }
        });

        if (!user) {
            console.log('❌ Không tìm thấy user "Trần Quang Vũ"');
            console.log('📋 Danh sách users:');
            const allUsers = await prisma.user.findMany({
                select: { id: true, fullName: true, phone: true, role: true }
            });
            console.table(allUsers);
            return;
        }

        console.log('✅ Tìm thấy user:', user.fullName, '-', user.phone);

        // Find an available unit
        console.log('🔍 Tìm căn hộ available...');
        const availableUnit = await prisma.unit.findFirst({
            where: {
                status: 'AVAILABLE'
            },
            include: {
                project: true,
                building: true
            }
        });

        if (!availableUnit) {
            console.log('❌ Không tìm thấy căn hộ available');
            return;
        }

        console.log('✅ Tìm thấy căn hộ:', availableUnit.code);

        // Create expired booking with past date (yesterday)
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(9, 0, 0, 0); // 9:00 AM yesterday
        
        // Expiry time is 10:30 AM yesterday (already passed)
        const expiryDateTime = new Date(yesterday);
        expiryDateTime.setHours(10, 30, 0, 0);

        // Generate booking code
        const bookingCount = await prisma.booking.count();
        const bookingCode = `BK${String(bookingCount + 1).padStart(6, '0')}`;

        console.log('📝 Tạo booking hết hạn...');
        
        // Create booking with EXPIRED status
        const booking = await prisma.booking.create({
            data: {
                code: bookingCode,
                unitId: availableUnit.id,
                ctvId: user.id,
                customerName: 'Nguyễn Văn Test',
                customerPhone: '0901234567',
                customerEmail: 'test@example.com',
                customerIdCard: '001234567890',
                customerAddress: '123 Test Street, District 1, Ho Chi Minh City',
                bookingAmount: 0,
                paymentMethod: 'NONE',
                status: 'EXPIRED',
                expiresAt: expiryDateTime,
                notes: `Lịch xem nhà: ${yesterday.toISOString().split('T')[0]} từ 09:00 đến 10:00`,
                approvedAt: yesterday,
                cancelledReason: 'Đã qua thời gian booking'
            }
        });

        console.log('✅ Đã tạo booking hết hạn:', booking.code);
        console.log('📋 Chi tiết:');
        console.log('   - Mã booking:', booking.code);
        console.log('   - CTV:', user.fullName);
        console.log('   - Căn hộ:', availableUnit.code);
        console.log('   - Ngày xem:', yesterday.toISOString().split('T')[0]);
        console.log('   - Giờ: 09:00 - 10:00');
        console.log('   - Hết hạn:', expiryDateTime.toLocaleString('vi-VN'));
        console.log('   - Trạng thái:', booking.status);
        console.log('   - Lý do:', booking.cancelledReason);
        console.log('\n🎉 Done! Booking should now show as "Hết hạn" in the UI');

    } catch (error) {
        console.error('❌ Lỗi:', error);
        console.error('Chi tiết:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

createExpiredBooking();

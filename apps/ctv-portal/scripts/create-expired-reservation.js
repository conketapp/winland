/**
 * Script to create an expired reservation for testing
 * Run with: node apps/ctv-portal/scripts/create-expired-reservation.js
 */

const { PrismaClient } = require('../lib/generated/prisma');
const prisma = new PrismaClient();

async function createExpiredReservation() {
    try {
        console.log('🔍 Finding available unit and CTV...');

        // Find a CTV user
        const ctv = await prisma.user.findFirst({
            where: {
                role: 'CTV'
            }
        });

        if (!ctv) {
            console.error('❌ No CTV user found. Please create a CTV user first.');
            return;
        }

        console.log(`✅ Found CTV: ${ctv.fullName} (${ctv.phone})`);

        // Find an available unit
        const unit = await prisma.unit.findFirst({
            where: {
                status: 'AVAILABLE'
            },
            include: {
                project: true,
                building: true
            }
        });

        if (!unit) {
            console.error('❌ No available unit found.');
            return;
        }

        console.log(`✅ Found unit: ${unit.code} in ${unit.project?.name}`);

        // Get the latest reservation code to generate next sequential code
        const latestReservation = await prisma.reservation.findFirst({
            orderBy: { code: 'desc' },
            select: { code: true }
        });

        let nextNumber = 1;
        if (latestReservation && latestReservation.code) {
            const match = latestReservation.code.match(/RS(\d+)/);
            if (match) {
                nextNumber = parseInt(match[1]) + 1;
            }
        }

        const reservationCode = `RS${String(nextNumber).padStart(6, '0')}`;

        // Create expired reservation (expired 1 hour ago)
        const expiredDate = new Date();
        expiredDate.setHours(expiredDate.getHours() - 1);

        const reservation = await prisma.reservation.create({
            data: {
                code: reservationCode,
                unitId: unit.id,
                ctvId: ctv.id,
                customerName: 'Test Customer (Expired)',
                customerPhone: '0999999999',
                customerEmail: 'expired@test.com',
                reservedUntil: expiredDate,
                status: 'ACTIVE', // Will be marked as EXPIRED by check-expired API
                priority: 1,
                extendCount: 0,
                notes: 'Test expired reservation for testing purposes'
            },
            include: {
                unit: {
                    include: {
                        project: true,
                        building: true,
                        floor: true
                    }
                },
                ctv: true
            }
        });

        // Update unit status to RESERVED_BOOKING
        await prisma.unit.update({
            where: { id: unit.id },
            data: { status: 'RESERVED_BOOKING' }
        });

        console.log('\n✅ Successfully created expired reservation!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`📋 Reservation Code: ${reservation.code}`);
        console.log(`🏢 Unit: ${reservation.unit.code}`);
        console.log(`👤 CTV: ${reservation.ctv.fullName}`);
        console.log(`👥 Customer: ${reservation.customerName}`);
        console.log(`⏰ Expired At: ${reservation.reservedUntil.toLocaleString('vi-VN')}`);
        console.log(`📊 Status: ${reservation.status} (will be EXPIRED after check-expired runs)`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('\n💡 To mark it as EXPIRED, the system will automatically');
        console.log('   detect it when you visit the dashboard or notification page.');
        console.log('\n🔄 Or you can manually trigger the check by calling:');
        console.log('   POST /api/reservations/check-expired');

    } catch (error) {
        console.error('❌ Error creating expired reservation:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createExpiredReservation();

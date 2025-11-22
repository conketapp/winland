/**
 * Reset Unit Status Script
 * 
 * This script helps reset a unit back to AVAILABLE status by:
 * 1. Cancelling all active deposits
 * 2. Cancelling all active bookings
 * 3. Cancelling all active reservations
 * 4. Setting unit status to AVAILABLE
 * 
 * Usage: node scripts/reset-unit-status.js T1-0102
 */

const { PrismaClient } = require('../lib/generated/prisma');

const prisma = new PrismaClient();

async function resetUnitStatus(unitCode) {
    try {
        console.log(`🔍 Finding unit: ${unitCode}...`);

        // Find the unit
        const unit = await prisma.unit.findUnique({
            where: { code: unitCode },
            include: {
                deposits: {
                    where: {
                        status: {
                            in: ['PENDING_APPROVAL', 'CONFIRMED']
                        }
                    }
                },
                bookings: {
                    where: {
                        status: {
                            in: ['CONFIRMED', 'PENDING_APPROVAL']
                        }
                    }
                },
                reservations: {
                    where: {
                        status: {
                            in: ['ACTIVE', 'YOUR_TURN']
                        }
                    }
                }
            }
        });

        if (!unit) {
            console.error(`❌ Unit ${unitCode} not found!`);
            return;
        }

        console.log(`✅ Found unit: ${unit.code}`);
        console.log(`   Current status: ${unit.status}`);
        console.log(`   Active deposits: ${unit.deposits.length}`);
        console.log(`   Active bookings: ${unit.bookings.length}`);
        console.log(`   Active reservations: ${unit.reservations.length}`);

        // Cancel all active deposits
        if (unit.deposits.length > 0) {
            console.log(`\n📝 Cancelling ${unit.deposits.length} active deposit(s)...`);
            for (const deposit of unit.deposits) {
                await prisma.deposit.update({
                    where: { id: deposit.id },
                    data: {
                        status: 'CANCELLED',
                        cancelledReason: 'Reset by admin script',
                        notes: deposit.notes 
                            ? `${deposit.notes}\n[RESET_BY_SCRIPT]`
                            : '[RESET_BY_SCRIPT]'
                    }
                });
                console.log(`   ✅ Cancelled deposit: ${deposit.code}`);
            }
        }

        // Cancel all active bookings
        if (unit.bookings.length > 0) {
            console.log(`\n📝 Cancelling ${unit.bookings.length} active booking(s)...`);
            for (const booking of unit.bookings) {
                await prisma.booking.update({
                    where: { id: booking.id },
                    data: {
                        status: 'CANCELLED',
                        cancelledReason: 'Reset by admin script',
                        notes: booking.notes 
                            ? `${booking.notes}\n[RESET_BY_SCRIPT]`
                            : '[RESET_BY_SCRIPT]'
                    }
                });
                console.log(`   ✅ Cancelled booking: ${booking.code}`);
            }
        }

        // Cancel all active reservations
        if (unit.reservations.length > 0) {
            console.log(`\n📝 Cancelling ${unit.reservations.length} active reservation(s)...`);
            for (const reservation of unit.reservations) {
                await prisma.reservation.update({
                    where: { id: reservation.id },
                    data: {
                        status: 'CANCELLED',
                        cancelledReason: 'Reset by admin script',
                        notes: reservation.notes 
                            ? `${reservation.notes}\n[RESET_BY_SCRIPT]`
                            : '[RESET_BY_SCRIPT]'
                    }
                });
                console.log(`   ✅ Cancelled reservation: ${reservation.code}`);
            }
        }

        // Update unit status to AVAILABLE
        console.log(`\n🔄 Updating unit status to AVAILABLE...`);
        await prisma.unit.update({
            where: { id: unit.id },
            data: { status: 'AVAILABLE' }
        });

        console.log(`\n✅ SUCCESS! Unit ${unitCode} is now AVAILABLE`);
        console.log(`\n📊 Summary:`);
        console.log(`   - Deposits cancelled: ${unit.deposits.length}`);
        console.log(`   - Bookings cancelled: ${unit.bookings.length}`);
        console.log(`   - Reservations cancelled: ${unit.reservations.length}`);
        console.log(`   - Unit status: AVAILABLE ✅`);

    } catch (error) {
        console.error('❌ Error resetting unit status:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Get unit code from command line argument
const unitCode = process.argv[2];

if (!unitCode) {
    console.error('❌ Please provide a unit code!');
    console.log('\nUsage: node scripts/reset-unit-status.js <UNIT_CODE>');
    console.log('Example: node scripts/reset-unit-status.js T1-0102');
    process.exit(1);
}

// Run the script
resetUnitStatus(unitCode);

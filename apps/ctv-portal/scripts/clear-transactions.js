/**
 * Clear all transactions (bookings, deposits, reservations) for testing
 * Run with: node apps/ctv-portal/scripts/clear-transactions.js
 */

const { PrismaClient } = require('../lib/generated/prisma');

const prisma = new PrismaClient();

async function clearTransactions() {
    try {
        console.log('🗑️  Starting to clear all transactions...\n');

        // Delete all bookings
        const deletedBookings = await prisma.booking.deleteMany({});
        console.log(`✅ Deleted ${deletedBookings.count} bookings`);

        // Delete all deposits
        const deletedDeposits = await prisma.deposit.deleteMany({});
        console.log(`✅ Deleted ${deletedDeposits.count} deposits`);

        // Delete all reservations
        const deletedReservations = await prisma.reservation.deleteMany({});
        console.log(`✅ Deleted ${deletedReservations.count} reservations`);

        // Reset all units to AVAILABLE status
        const updatedUnits = await prisma.unit.updateMany({
            data: {
                status: 'AVAILABLE'
            }
        });
        console.log(`✅ Reset ${updatedUnits.count} units to AVAILABLE status`);

        console.log('\n✨ All transactions cleared successfully!');
        console.log('📝 You can now test with fresh data.');

    } catch (error) {
        console.error('❌ Error clearing transactions:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

clearTransactions()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

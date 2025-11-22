import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/lib/generated/prisma';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { depositId } = body;

        if (!depositId) {
            return NextResponse.json(
                { error: 'Deposit ID is required' },
                { status: 400 }
            );
        }

        // Get deposit with unit and project info
        const deposit = await prisma.deposit.findUnique({
            where: { id: depositId },
            include: {
                unit: {
                    include: {
                        project: true
                    }
                }
            }
        });

        if (!deposit) {
            return NextResponse.json(
                { error: 'Deposit not found' },
                { status: 404 }
            );
        }

        // Check if deposit is in valid status
        if (deposit.status !== 'CONFIRMED' && deposit.status !== 'PENDING_APPROVAL') {
            return NextResponse.json(
                { error: 'Deposit cannot be completed in current status' },
                { status: 400 }
            );
        }

        // Check if commission already exists
        const existingCommission = await prisma.commission.findUnique({
            where: { depositId: depositId }
        });

        if (existingCommission) {
            return NextResponse.json(
                { error: 'Commission already exists for this deposit' },
                { status: 400 }
            );
        }

        // Calculate commission
        const commissionRate = deposit.unit.commissionRate || deposit.unit.project.commissionRate || 2.0;
        const commissionAmount = (deposit.unit.price * commissionRate) / 100;

        // Update deposit status to COMPLETED and unit status to SOLD, and create commission
        const result = await prisma.$transaction(async (tx) => {
            // Update deposit status
            const updatedDeposit = await tx.deposit.update({
                where: { id: depositId },
                data: {
                    status: 'COMPLETED',
                    updatedAt: new Date()
                }
            });

            // Update unit status to SOLD
            await tx.unit.update({
                where: { id: deposit.unitId },
                data: {
                    status: 'SOLD',
                    updatedAt: new Date()
                }
            });

            // Create commission record
            const commission = await tx.commission.create({
                data: {
                    unitId: deposit.unitId,
                    ctvId: deposit.ctvId,
                    depositId: depositId,
                    amount: commissionAmount,
                    rate: commissionRate,
                    status: 'PENDING'
                }
            });

            return { deposit: updatedDeposit, commission };
        });

        return NextResponse.json({
            success: true,
            message: 'Deposit completed successfully',
            deposit: result.deposit,
            commission: result.commission
        });

    } catch (error) {
        console.error('Complete deposit error:', error);
        return NextResponse.json(
            { error: 'Failed to complete deposit' },
            { status: 500 }
        );
    }
}

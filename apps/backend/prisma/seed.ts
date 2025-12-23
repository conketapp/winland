/**
 * Simplified Database Seed
 * Matches actual Prisma schema
 */

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...\n');

  // 1. Users
  console.log('👥 Creating Users...');
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@batdongsan.com' },
    update: {},
    create: {
      email: 'admin@batdongsan.com',
      password: adminPassword,
      fullName: 'Admin User',
      phone: '0901234567',
      role: 'ADMIN',
      isActive: true,
    },
  });
  console.log('✅ Admin:', admin.email);

  // Create CTVs
  const ctvs = [];
  for (let i = 1; i <= 3; i++) {
    const ctvPassword = await bcrypt.hash('ctv123', 10);
    const ctv = await prisma.user.upsert({
      where: { phone: `091234567${i}` },
      update: {},
      create: {
        phone: `091234567${i}`,
        email: `ctv${i}@batdongsan.com`,
        password: ctvPassword,
        fullName: `CTV User ${i}`,
        role: 'CTV',
        isActive: true,
      },
    });
    ctvs.push(ctv);
    console.log(`✅ CTV ${i}:`, ctv.phone);
  }

  // 2. Unit Types
  console.log('\n🏠 Creating Unit Types...');
  const unitTypes = [
    { name: 'Studio', code: 'STUDIO' },
    { name: '1 Phòng ngủ', code: '1BR' },
    { name: '2 Phòng ngủ', code: '2BR' },
  ];
  for (const type of unitTypes) {
    await prisma.unitType.upsert({
      where: { code: type.code },
      update: {},
      create: type,
    });
  }
  console.log('✅ Created 3 Unit Types');

  // 3. Projects (đa trạng thái để dễ demo)
  console.log('\n🏗️  Creating Projects...');

  const openProject = await prisma.project.upsert({
    where: { code: 'VHS-2025' },
    update: {},
    create: {
      name: 'Vinhomes Smart City',
      code: 'VHS-2025',
      status: 'OPEN',
      developer: 'Vingroup',
      location: 'Nam Từ Liêm, Hà Nội',
      address: 'Đại lộ Thăng Long',
      district: 'Nam Từ Liêm',
      city: 'Hà Nội',
      totalBuildings: 2,
      totalUnits: 100,
      priceFrom: 2000000000,
      priceTo: 5000000000,
      description: 'Dự án căn hộ cao cấp',
      commissionRate: 2.5,
      openDate: new Date('2025-01-01'),
      createdBy: admin.id,
    },
  });

  const upcomingProject = await prisma.project.upsert({
    where: { code: 'SUNRISE-2026' },
    update: {},
    create: {
      name: 'Sunrise Riverside',
      code: 'SUNRISE-2026',
      status: 'UPCOMING',
      developer: 'Novaland',
      location: 'Quận 7, TP.HCM',
      address: 'Nguyễn Văn Linh',
      district: 'Quận 7',
      city: 'TP.HCM',
      totalBuildings: 3,
      totalUnits: 450,
      priceFrom: 2500000000,
      priceTo: 6000000000,
      description: 'Khu căn hộ ven sông, chuẩn resort',
      commissionRate: 2.0,
      openDate: new Date('2026-03-01'),
      createdBy: admin.id,
    },
  });

  const closedProject = await prisma.project.upsert({
    where: { code: 'LAKEVIEW-2024' },
    update: {},
    create: {
      name: 'Lakeview Residence',
      code: 'LAKEVIEW-2024',
      status: 'CLOSED',
      developer: 'Nam Long',
      location: 'Thủ Đức, TP.HCM',
      address: 'Phạm Văn Đồng',
      district: 'Thủ Đức',
      city: 'TP.HCM',
      totalBuildings: 2,
      totalUnits: 220,
      priceFrom: 1800000000,
      priceTo: 4000000000,
      description: 'Dự án đã bán hết, view hồ trung tâm',
      commissionRate: 1.5,
      openDate: new Date('2024-05-01'),
      createdBy: admin.id,
    },
  });

  console.log('✅ Projects:', openProject.name, '/', upcomingProject.name, '/', closedProject.name);

  // 4. Buildings & Floors cho dự án đang OPEN - FIXED: Using upsert instead of create
  console.log('\n🏢 Creating Buildings...');
  const buildings = [];
  for (let i = 1; i <= 2; i++) {
    const building = await prisma.building.upsert({
      where: {
        projectId_code: {
          projectId: openProject.id,
          code: `A${i}`,
        },
      },
      update: {},
      create: {
        projectId: openProject.id,
        code: `A${i}`,
        name: `Tòa A${i}`,
        floors: 15,
      },
    });
    buildings.push(building);

    // Create floors - FIXED: Using upsert for floors as well
    for (let f = 5; f <= 10; f++) {
      await prisma.floor.upsert({
        where: {
          buildingId_number: {
            buildingId: building.id,
            number: f,
          },
        },
        update: {},
        create: {
          buildingId: building.id,
          number: f,
        },
      });
    }
  }
  console.log('✅ Created 2 Buildings for', openProject.code);

  // 5. Units - FIXED: Using upsert for units
  console.log('\n🏘️  Creating Units...');
  let unitCount = 0;
  for (const building of buildings) {
    const floors = await prisma.floor.findMany({
      where: { buildingId: building.id },
      orderBy: { number: 'asc' }
    });

    for (const floor of floors) {
      for (let u = 1; u <= 3; u++) {
        const code = `${building.code}-${floor.number}${u.toString().padStart(2, '0')}`;
        await prisma.unit.upsert({
          where: {
              code: code,
          },
          update: {},
          create: {
            projectId: openProject.id,
            buildingId: building.id,
            floorId: floor.id,
            code,
            unitNumber: `${floor.number}${u.toString().padStart(2, '0')}`,
            status: 'AVAILABLE',
            price: 2500000000,
            area: 75,
            bedrooms: 2,
            bathrooms: 2,
            direction: 'Đông',
            balcony: true,
          },
        });
        unitCount++;
      }
    }
  }
  console.log(`✅ Created ${unitCount} Units`);

  // 6. System Configs
  console.log('\n⚙️  Creating System Configs...');
  const configs = [
    { key: 'BOOKING_DURATION', value: '24', type: 'number', label: 'Thời gian giữ chỗ (giờ)', category: 'booking' },
    { key: 'COMMISSION_RATE', value: '2.5', type: 'number', label: 'Hoa hồng mặc định (%)', category: 'commission' },
  ];
  for (const config of configs) {
    await prisma.systemConfig.upsert({
      where: { key: config.key },
      update: {},
      create: config,
    });
  }
  console.log('✅ Created System Configs');

  // 7. Get available units for bookings/deposits
  const availableUnits = await prisma.unit.findMany({
    where: { 
      projectId: openProject.id,
      status: 'AVAILABLE',
      deletedAt: null,
    },
    take: 10,
  });

  if (availableUnits.length > 0) {
    // 8. Create Bookings (PENDING_APPROVAL để duyệt)
    console.log('\n📋 Creating Bookings...');
    const bookingUnits = availableUnits.slice(0, 3);
    let bookingCount = 0;

    for (let i = 0; i < bookingUnits.length; i++) {
      const unit = bookingUnits[i];
      const ctv = ctvs[i % ctvs.length];
      
      // Calculate booking amount (1% of unit price)
      const bookingAmount = Math.floor(unit.price * 0.01);
      
      // Expires in 24 hours
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      const bookingCode = `BK${String(bookingCount + 1).padStart(6, '0')}`;
      
      // Check if booking with this code already exists
      const existingBooking = await prisma.booking.findUnique({
        where: { code: bookingCode },
      });

      if (existingBooking) {
        console.log(`⏭️  Booking ${bookingCode} already exists, skipping...`);
        bookingCount++;
        continue;
      }

      const booking = await prisma.booking.create({
        data: {
          code: bookingCode,
          unitId: unit.id,
          ctvId: ctv.id,
          customerName: `Khách hàng Booking ${bookingCount + 1}`,
          customerPhone: `098765432${bookingCount + 1}`,
          customerEmail: `customer.booking${bookingCount + 1}@example.com`,
          bookingAmount,
          paymentMethod: 'BANK_TRANSFER',
          paymentProof: JSON.stringify({ 
            url: 'https://example.com/proof.jpg',
            uploadedAt: new Date().toISOString(),
          }),
          status: 'PENDING_APPROVAL',
          expiresAt,
          notes: `Booking test ${bookingCount + 1} - Cần duyệt`,
        },
      });

      // Update unit status
      await prisma.unit.update({
        where: { id: unit.id },
        data: { status: 'RESERVED_BOOKING' },
      });

      bookingCount++;
      console.log(`✅ Booking ${bookingCount}: ${booking.code} - ${booking.customerName}`);
    }

    // 9. Create Deposits (PENDING_APPROVAL và APPROVED)
    console.log('\n💰 Creating Deposits...');
    const depositUnits = availableUnits.slice(3, 8);
    let depositCount = 0;
    const approvedDeposits = [];

    for (let i = 0; i < depositUnits.length; i++) {
      const unit = depositUnits[i];
      const ctv = ctvs[i % ctvs.length];
      
      // Calculate deposit amount (10% of unit price)
      const depositAmount = Math.floor(unit.price * 0.1);
      const depositPercentage = 10;
      
      const status: 'PENDING_APPROVAL' | 'CONFIRMED' = i < 2 ? 'PENDING_APPROVAL' : 'CONFIRMED';
      const depositDate = new Date();
      depositDate.setDate(depositDate.getDate() - (5 - i)); // Spread dates

      const depositCode = `DP${String(depositCount + 1).padStart(6, '0')}`;
      
      // Check if deposit with this code already exists
      const existingDeposit = await prisma.deposit.findUnique({
        where: { code: depositCode },
      });

      if (existingDeposit) {
        console.log(`⏭️  Deposit ${depositCode} already exists, skipping...`);
        depositCount++;
        continue;
      }

      const deposit = await prisma.deposit.create({
        data: {
          code: depositCode,
          unitId: unit.id,
          ctvId: ctv.id,
          customerName: `Khách hàng Deposit ${depositCount + 1}`,
          customerPhone: `097654321${depositCount + 1}`,
          customerEmail: `customer.deposit${depositCount + 1}@example.com`,
          customerIdCard: `00123456789${depositCount + 1}`,
          customerAddress: `123 Đường ABC, Quận XYZ, TP.HCM`,
          depositAmount,
          depositPercentage,
          depositDate,
          paymentMethod: 'BANK_TRANSFER',
          paymentProof: JSON.stringify({ 
            url: 'https://example.com/payment-proof.jpg',
            uploadedAt: depositDate.toISOString(),
          }),
          status,
          approvedBy: status === 'CONFIRMED' ? admin.id : null,
          approvedAt: status === 'CONFIRMED' ? depositDate : null,
          notes: `Deposit test ${depositCount + 1} - ${status}`,
        },
      });

      // Update unit status
      await prisma.unit.update({
        where: { id: unit.id },
        data: { 
          status: status === 'CONFIRMED' ? 'DEPOSITED' : 'RESERVED_BOOKING',
        },
      });

      if (status === 'CONFIRMED') {
        approvedDeposits.push(deposit);
      }

      depositCount++;
      console.log(`✅ Deposit ${depositCount}: ${deposit.code} - ${deposit.customerName} (${status})`);
    }

    // 10. Create Payment Schedules for approved deposits
    console.log('\n📅 Creating Payment Schedules...');
    let scheduleCount = 0;

    for (const deposit of approvedDeposits) {
      const unit = await prisma.unit.findUnique({ where: { id: deposit.unitId } });
      if (!unit) continue;

      const totalPrice = unit.price;
      const remainingAmount = totalPrice - deposit.depositAmount;
      
      // Create 3 payment schedules (30%, 30%, 40%)
      const schedules = [
        { installment: 2, name: 'Đợt 1', percentage: 30, amount: Math.floor(remainingAmount * 0.3) },
        { installment: 3, name: 'Đợt 2', percentage: 30, amount: Math.floor(remainingAmount * 0.3) },
        { installment: 4, name: 'Đợt 3', percentage: 40, amount: remainingAmount - Math.floor(remainingAmount * 0.3) - Math.floor(remainingAmount * 0.3) },
      ];

      for (const schedule of schedules) {
        const dueDate = new Date(deposit.depositDate);
        dueDate.setMonth(dueDate.getMonth() + schedule.installment - 1);

        await prisma.paymentSchedule.create({
          data: {
            depositId: deposit.id,
            installment: schedule.installment,
            name: schedule.name,
            percentage: schedule.percentage,
            amount: schedule.amount,
            dueDate,
            status: 'PENDING',
            paidAmount: 0,
          },
        });
        scheduleCount++;
      }
      console.log(`✅ Created 3 payment schedules for ${deposit.code}`);
    }

    // 11. Create Transactions (from approved deposits with payment schedules)
    console.log('\n💸 Creating Transactions...');
    let transactionCount = 0;

    for (const deposit of approvedDeposits.slice(0, 2)) {
      const schedules = await prisma.paymentSchedule.findMany({
        where: { depositId: deposit.id },
        orderBy: { installment: 'asc' },
      });

      if (schedules.length > 0) {
        // Create some paid transactions
        for (let i = 0; i < Math.min(2, schedules.length); i++) {
          const schedule = schedules[i];
          const transactionDate = new Date(schedule.dueDate);
          transactionDate.setDate(transactionDate.getDate() - 5); // Paid 5 days before due

          const transaction = await prisma.transaction.create({
            data: {
            depositId: deposit.id,
            paymentScheduleId: schedule.id,
            amount: schedule.amount,
              paymentMethod: 'BANK_TRANSFER',
              paymentProof: JSON.stringify([
                'https://example.com/transaction-proof-1.jpg',
                'https://example.com/transaction-proof-2.jpg',
              ]),
              paymentDate: transactionDate,
              status: 'CONFIRMED' as const,
              confirmedAt: transactionDate,
              notes: `Thanh toán ${schedule.name} - Tự động xác nhận`,
            },
          });

          // Update payment schedule
          await prisma.paymentSchedule.update({
            where: { id: schedule.id },
            data: {
              status: 'PAID',
              paidAmount: schedule.amount,
              paidAt: transactionDate,
            },
          });

          transactionCount++;
          console.log(`✅ Transaction ${transactionCount}: ${schedule.name} - ${formatCurrency(transaction.amount)}`);
        }
      }
    }

    console.log(`\n✅ Created ${transactionCount} Transactions`);
  }

  // 12. Create Documents (for testing documents page)
  console.log('\n📄 Creating Documents...');
  let documentCount = 0;

  // Get all deposits, bookings, transactions, and units
  const allDeposits = await prisma.deposit.findMany({ take: 10 });
  const allBookings = await prisma.booking.findMany({ take: 10 });
  const allTransactions = await prisma.transaction.findMany({ take: 10 });
  const allUnits = await prisma.unit.findMany({ take: 10 });

  // Create documents for deposits
  for (const deposit of allDeposits) {
    const documents = [
      {
        documentType: 'CMND_FRONT' as const,
        fileName: `cmnd_front_${deposit.code}.jpg`,
        fileUrl: `/storage/uploads/deposit/cmnd_front_${deposit.code}_${Date.now()}.jpg`,
        fileSize: 245678,
        mimeType: 'image/jpeg',
        description: 'CMND/CCCD mặt trước',
        status: 'FINAL' as const,
      },
      {
        documentType: 'CMND_BACK' as const,
        fileName: `cmnd_back_${deposit.code}.jpg`,
        fileUrl: `/storage/uploads/deposit/cmnd_back_${deposit.code}_${Date.now()}.jpg`,
        fileSize: 251234,
        mimeType: 'image/jpeg',
        description: 'CMND/CCCD mặt sau',
        status: 'FINAL' as const,
      },
      {
        documentType: 'CONTRACT_SIGNED' as const,
        fileName: `contract_${deposit.code}.pdf`,
        fileUrl: `/storage/uploads/deposit/contract_${deposit.code}_${Date.now()}.pdf`,
        fileSize: 1024567,
        mimeType: 'application/pdf',
        description: 'Bản sao hợp đồng đã ký',
        status: 'FINAL' as const,
      },
      {
        documentType: 'PAYMENT_PROOF' as const,
        fileName: `payment_proof_${deposit.code}.jpg`,
        fileUrl: `/storage/uploads/deposit/payment_proof_${deposit.code}_${Date.now()}.jpg`,
        fileSize: 312456,
        mimeType: 'image/jpeg',
        description: 'Chứng từ thanh toán',
        status: deposit.status === 'CONFIRMED' ? 'FINAL' as const : 'DRAFT' as const,
      },
    ];

    for (const doc of documents) {
      await prisma.document.create({
        data: {
          entityType: 'deposit',
          entityId: deposit.id,
          documentType: doc.documentType,
          fileName: doc.fileName,
          fileUrl: doc.fileUrl,
          fileSize: BigInt(doc.fileSize),
          mimeType: doc.mimeType,
          description: doc.description,
          status: doc.status,
          uploadedBy: deposit.ctvId,
          metadata: {
            depositCode: deposit.code,
            createdAt: new Date().toISOString(),
          },
        },
      });
      documentCount++;
    }
  }
  console.log(`✅ Created ${documentCount} documents for deposits`);

  // Create documents for bookings
  let bookingDocCount = 0;
  for (const booking of allBookings) {
    await prisma.document.create({
      data: {
        entityType: 'booking',
        entityId: booking.id,
        documentType: 'PAYMENT_PROOF',
        fileName: `booking_payment_${booking.code}.jpg`,
        fileUrl: `/storage/uploads/booking/payment_${booking.code}_${Date.now()}.jpg`,
        fileSize: BigInt(298765),
        mimeType: 'image/jpeg',
        description: 'Chứng từ thanh toán booking',
        status: booking.status === 'CONFIRMED' ? 'FINAL' : 'DRAFT',
        uploadedBy: booking.ctvId,
        metadata: {
          bookingCode: booking.code,
        },
      },
    });
    bookingDocCount++;
    documentCount++;
  }
  console.log(`✅ Created ${bookingDocCount} documents for bookings`);

  // Create documents for transactions
  let transactionDocCount = 0;
  for (const transaction of allTransactions) {
    await prisma.document.create({
      data: {
        entityType: 'transaction',
        entityId: transaction.id,
        documentType: 'PAYMENT_PROOF',
        fileName: `transaction_proof_${transaction.id.slice(0, 8)}.jpg`,
        fileUrl: `/storage/uploads/transaction/proof_${transaction.id.slice(0, 8)}_${Date.now()}.jpg`,
        fileSize: BigInt(345678),
        mimeType: 'image/jpeg',
        description: 'Chứng từ thanh toán giao dịch',
        status: transaction.status === 'CONFIRMED' ? 'FINAL' : 'DRAFT',
        uploadedBy: ctvs[0].id, // Use first CTV
        metadata: {
          transactionId: transaction.id,
          paymentDate: transaction.paymentDate.toISOString(),
        },
      },
    });
    transactionDocCount++;
    documentCount++;
  }
  console.log(`✅ Created ${transactionDocCount} documents for transactions`);

  // Create documents for units (images)
  let unitDocCount = 0;
  for (const unit of allUnits.slice(0, 5)) {
    await prisma.document.create({
      data: {
        entityType: 'unit',
        entityId: unit.id,
        documentType: 'UNIT_IMAGE',
        fileName: `unit_image_${unit.code}.jpg`,
        fileUrl: `/storage/uploads/unit/image_${unit.code}_${Date.now()}.jpg`,
        fileSize: BigInt(567890),
        mimeType: 'image/jpeg',
        description: 'Ảnh căn hộ',
        status: 'FINAL',
        uploadedBy: admin.id,
        metadata: {
          unitCode: unit.code,
          projectId: unit.projectId,
        },
      },
    });
    unitDocCount++;
    documentCount++;
  }
  console.log(`✅ Created ${unitDocCount} documents for units`);

  console.log(`\n✅ Total: ${documentCount} documents created`);

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎉 SEED COMPLETED!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('📊 Summary:');
  console.log(`   - Users: ${1 + ctvs.length}`);
  console.log(`   - Projects: 3`);
  console.log(`   - Buildings: 2`);
  console.log(`   - Units: ${unitCount}`);
  console.log(`   - Bookings: 3 (PENDING_APPROVAL)`);
  console.log(`   - Deposits: 5 (2 PENDING_APPROVAL, 3 CONFIRMED)`);
  console.log(`   - Payment Schedules: 9 (3 per approved deposit)`);
  console.log(`   - Transactions: 4 (CONFIRMED)`);
  console.log(`   - Documents: ${documentCount} (deposits, bookings, transactions, units)`);
  console.log('\n🔐 Login:');
  console.log('   Admin: admin@batdongsan.com / admin123');
  console.log('   CTV 1: ctv1@batdongsan.com / ctv123');
  console.log('   CTV 2: ctv2@batdongsan.com / ctv123');
  console.log('   CTV 3: ctv3@batdongsan.com / ctv123\n');
  console.log('📋 Test Data:');
  console.log('   - Duyệt Booking: /bookings (3 bookings PENDING_APPROVAL)');
  console.log('   - Duyệt Deposit: /deposits (2 deposits PENDING_APPROVAL)');
  console.log('   - Xem Transactions: /transactions (4 transactions CONFIRMED)');
  console.log('   - Quản lý Tài liệu: /documents (tài liệu đầy đủ)\n');
}

// Helper function
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
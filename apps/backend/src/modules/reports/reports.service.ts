import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SalesReportQueryDto, SalesGroupBy } from './dto/sales-report-query.dto';
import { TransactionStatus, UnitStatus, CommissionStatus, Prisma } from '@prisma/client';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  private getDateRange(from?: string, to?: string): { start: Date; end: Date } {
    const end = to ? new Date(to) : new Date();
    const start = from ? new Date(from) : new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
    return { start, end };
  }

  async getSalesReport(query: SalesReportQueryDto) {
    const { start, end } = this.getDateRange(query.from, query.to);

    const whereDeposit: any = {
      createdAt: { gte: start, lte: end },
      status: 'CONFIRMED',
    };

    if (query.projectId) {
      whereDeposit.unit = { projectId: query.projectId };
    }
    if (query.ctvId) {
      whereDeposit.ctvId = query.ctvId;
    }
    if (query.status) {
      whereDeposit.status = query.status as any;
    }

    const deposits = await this.prisma.deposit.findMany({
      where: whereDeposit,
      include: {
        unit: {
          include: {
            project: true,
          },
        },
        ctv: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const totalDeals = deposits.length;
    const totalRevenue = deposits.reduce(
      (sum, d) => sum + (d.finalPrice || d.unit.price || 0),
      0,
    );

    const groupBy = query.groupBy || SalesGroupBy.PROJECT;

    const groups: Record<
      string,
      {
        key: string;
        label: string;
        deals: number;
        revenue: number;
      }
    > = {};

    for (const d of deposits) {
      const key =
        groupBy === SalesGroupBy.CTV
          ? d.ctvId || 'unknown'
          : d.unit.projectId || 'unknown';

      const label =
        groupBy === SalesGroupBy.CTV
          ? d.ctv?.fullName || 'Không rõ CTV'
          : d.unit.project?.name || 'Không rõ dự án';

      if (!groups[key]) {
        groups[key] = { key, label, deals: 0, revenue: 0 };
      }

      groups[key].deals += 1;
      groups[key].revenue += d.finalPrice || d.unit.price || 0;
    }

    const grouped = Object.values(groups).sort((a, b) => b.revenue - a.revenue);

    return {
      summary: {
        totalDeals,
        totalRevenue,
        from: start,
        to: end,
        groupBy,
      },
      items: grouped,
      raw: deposits.map((d) => ({
        id: d.id,
        code: d.code,
        projectName: d.unit.project?.name,
        projectCode: d.unit.project?.code,
        unitCode: d.unit.code,
        ctvName: d.ctv?.fullName,
        amount: d.finalPrice || d.unit.price || d.depositAmount,
        status: d.status,
        createdAt: d.createdAt,
      })),
    };
  }

  /**
   * Commission Report - báo cáo hoa hồng
   */
  async getCommissionReport(query: {
    from?: string;
    to?: string;
    ctvId?: string;
    projectId?: string;
    status?: CommissionStatus;
    groupBy?: 'CTV' | 'PROJECT';
  }) {
    const { start, end } = this.getDateRange(query.from, query.to);

    const where: Prisma.CommissionWhereInput = {
      deletedAt: null,
      createdAt: {
        gte: start,
        lte: end,
      },
    };

    if (query.ctvId) {
      where.ctvId = query.ctvId;
    }
    if (query.projectId) {
      where.unit = { projectId: query.projectId };
    }
    if (query.status) {
      where.status = query.status;
    }

    const commissions = await this.prisma.commission.findMany({
      where,
      include: {
        ctv: true,
        unit: {
          include: {
            project: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const totalAmount = commissions.reduce((sum, c) => sum + c.amount, 0);
    const byStatus: Record<CommissionStatus, number> = {
      PENDING: 0,
      APPROVED: 0,
      PAID: 0,
    };

    commissions.forEach((c) => {
      byStatus[c.status] = (byStatus[c.status] || 0) + c.amount;
    });

    const groupBy = query.groupBy || 'CTV';
    const groups: Record<
      string,
      {
        key: string;
        label: string;
        amount: number;
        count: number;
        pending: number;
        approved: number;
        paid: number;
      }
    > = {};

    commissions.forEach((c) => {
      const key = groupBy === 'CTV' ? c.ctvId : c.unit?.projectId || 'unknown';
      const label =
        groupBy === 'CTV'
          ? c.ctv?.fullName || 'CTV không rõ'
          : c.unit?.project?.name || 'Dự án không rõ';

      if (!groups[key]) {
        groups[key] = { key, label, amount: 0, count: 0, pending: 0, approved: 0, paid: 0 };
      }

      const g = groups[key];
      g.amount += c.amount;
      g.count += 1;
      if (c.status === 'PENDING') g.pending += c.amount;
      if (c.status === 'APPROVED') g.approved += c.amount;
      if (c.status === 'PAID') g.paid += c.amount;
    });

    const rankings = Object.values(groups).sort((a, b) => b.amount - a.amount);

    return {
      summary: {
        totalAmount,
        totalCount: commissions.length,
        byStatus,
        from: start,
        to: end,
      },
      rankings,
      raw: commissions.map((c) => ({
        id: c.id,
        amount: c.amount,
        status: c.status,
        ctvId: c.ctvId,
        ctvName: c.ctv?.fullName,
        projectId: c.unit?.projectId,
        projectName: c.unit?.project?.name,
        projectCode: c.unit?.project?.code,
        unitCode: c.unit?.code,
        createdAt: c.createdAt,
      })),
    };
  }

  /**
   * Transaction Report - tổng quan giao dịch + cash flow theo ngày
   */
  async getTransactionReport(query: { from?: string; to?: string; status?: TransactionStatus }) {
    const { start, end } = this.getDateRange(query.from, query.to);

    const where: any = {
      paymentDate: { gte: start, lte: end },
    };
    if (query.status) {
      where.status = query.status;
    }

    const transactions = await this.prisma.transaction.findMany({
      where,
      include: {
        deposit: {
          include: {
            unit: {
              include: {
                project: true,
              },
            },
          },
        },
      },
      orderBy: { paymentDate: 'asc' },
    });

    const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);

    // Cash flow theo ngày
    const cashFlowByDate: Record<
      string,
      {
        date: string;
        total: number;
        count: number;
      }
    > = {};

    for (const t of transactions) {
      const key = t.paymentDate.toISOString().split('T')[0];
      if (!cashFlowByDate[key]) {
        cashFlowByDate[key] = { date: key, total: 0, count: 0 };
      }
      cashFlowByDate[key].total += t.amount;
      cashFlowByDate[key].count += 1;
    }

    const cashFlow = Object.values(cashFlowByDate).sort((a, b) =>
      a.date.localeCompare(b.date),
    );

    const byStatus: Record<TransactionStatus, number> = {
      PENDING_CONFIRMATION: 0,
      CONFIRMED: 0,
      CANCELLED: 0,
    };
    transactions.forEach((t) => {
      byStatus[t.status] = (byStatus[t.status] || 0) + t.amount;
    });

    return {
      summary: {
        totalAmount,
        totalCount: transactions.length,
        byStatus,
        from: start,
        to: end,
      },
      cashFlow,
      raw: transactions.map((t) => ({
        id: t.id,
        amount: t.amount,
        status: t.status,
        paymentDate: t.paymentDate,
        projectName: t.deposit?.unit?.project?.name,
        projectCode: t.deposit?.unit?.project?.code,
        unitCode: t.deposit?.unit?.code,
        depositCode: t.deposit?.code,
      })),
    };
  }

  /**
   * Inventory Report - tồn kho đơn giản theo dự án & trạng thái
   */
  async getInventoryReport(query: { projectId?: string }) {
    const whereUnit: any = {
      deletedAt: null,
    };
    if (query.projectId) {
      whereUnit.projectId = query.projectId;
    }

    const units = await this.prisma.unit.findMany({
      where: whereUnit,
      include: {
        project: true,
      },
    });

    const totalUnits = units.length;
    const statusCounts: Record<UnitStatus, number> = {
      AVAILABLE: 0,
      RESERVED_BOOKING: 0,
      DEPOSITED: 0,
      SOLD: 0,
    } as any;

    units.forEach((u) => {
      statusCounts[u.status] = (statusCounts[u.status] || 0) + 1;
    });

    // Group by project
    const byProject: Record<
      string,
      {
        projectId: string;
        projectName: string;
        projectCode: string;
        total: number;
        available: number;
        reserved: number;
        deposited: number;
        sold: number;
      }
    > = {};

    units.forEach((u) => {
      const key = u.projectId;
      const projectName = u.project?.name || 'Dự án không rõ';
      const projectCode = u.project?.code || '';
      if (!byProject[key]) {
        byProject[key] = {
          projectId: key,
          projectName,
          projectCode,
          total: 0,
          available: 0,
          reserved: 0,
          deposited: 0,
          sold: 0,
        };
      }
      const p = byProject[key];
      p.total += 1;
      if (u.status === 'AVAILABLE') p.available += 1;
      if (u.status === 'RESERVED_BOOKING') p.reserved += 1;
      if (u.status === 'DEPOSITED') p.deposited += 1;
      if (u.status === 'SOLD') p.sold += 1;
    });

    const projects = Object.values(byProject).sort(
      (a, b) => b.sold - a.sold,
    );

    return {
      summary: {
        totalUnits,
        statusCounts,
      },
      projects,
    };
  }
}


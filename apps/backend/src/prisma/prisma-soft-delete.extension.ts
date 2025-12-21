import { Prisma } from '@prisma/client';

/**
 * Prisma Extension for Soft Delete
 * Automatically filters out deleted records (deletedAt IS NULL)
 * Only applies to models that have a deletedAt field
 */
export const softDeleteExtension = Prisma.defineExtension({
  name: 'softDelete',
  query: {
    $allModels: {
      async findMany({ args, query, model }) {
        // Only apply soft delete filter if model has deletedAt field
        // Skip if already filtered (code already filters deletedAt manually in some cases)
        if (hasDeletedAtField(model)) {
          if (!args.where) {
            args.where = { deletedAt: null };
          } else if (!('deletedAt' in args.where)) {
            // Check if deletedAt is in AND array
            const whereAny = args.where as any;
            const hasDeletedAtInAnd = Array.isArray(whereAny.AND) && whereAny.AND.some((cond: any) => 'deletedAt' in cond);
            // Check if there are nested relations in where (like where.unit = {...})
            // Only skip if nested relation doesn't already have deletedAt
            const hasNestedRelations = Object.keys(whereAny).some(key => 
              typeof whereAny[key] === 'object' && 
              whereAny[key] !== null && 
              !Array.isArray(whereAny[key]) &&
              key !== 'AND' && 
              key !== 'OR' && 
              key !== 'NOT' &&
              !('deletedAt' in whereAny[key]) && // Only skip if nested relation doesn't have deletedAt
              Object.keys(whereAny[key]).some(subKey => typeof whereAny[key][subKey] === 'object')
            );
            if (!hasDeletedAtInAnd && !hasNestedRelations) {
              // Only add deletedAt if it's not already specified and no nested relations without deletedAt
              args.where = {
                ...args.where,
                deletedAt: null,
              };
            }
          }
        }
        return query(args);
      },
      async findFirst({ args, query, model }) {
        if (hasDeletedAtField(model)) {
          if (!args.where) {
            args.where = { deletedAt: null };
          } else if (!('deletedAt' in args.where)) {
            // Check if deletedAt is in AND array
            const whereAny = args.where as any;
            const hasDeletedAtInAnd = Array.isArray(whereAny.AND) && whereAny.AND.some((cond: any) => 'deletedAt' in cond);
            if (!hasDeletedAtInAnd) {
              args.where = {
                ...args.where,
                deletedAt: null,
              };
            }
          }
        }
        return query(args);
      },
      async findUnique({ args, query, model }) {
        // For findUnique, we need to check after query
        const result = await query(args);
        if (hasDeletedAtField(model) && result && 'deletedAt' in result && result.deletedAt !== null) {
          return null;
        }
        return result;
      },
      async count({ args, query, model }) {
        if (hasDeletedAtField(model)) {
          if (!args.where) {
            args.where = { deletedAt: null };
          } else if (!('deletedAt' in args.where)) {
            // Check if deletedAt is in AND array
            const whereAny = args.where as any;
            const hasDeletedAtInAnd = Array.isArray(whereAny.AND) && whereAny.AND.some((cond: any) => 'deletedAt' in cond);
            // Check if there are nested relations in where (like where.unit = {...})
            // Only skip if nested relation doesn't already have deletedAt
            const hasNestedRelations = Object.keys(whereAny).some(key => 
              typeof whereAny[key] === 'object' && 
              whereAny[key] !== null && 
              !Array.isArray(whereAny[key]) &&
              key !== 'AND' && 
              key !== 'OR' && 
              key !== 'NOT' &&
              !('deletedAt' in whereAny[key]) && // Only skip if nested relation doesn't have deletedAt
              Object.keys(whereAny[key]).some(subKey => typeof whereAny[key][subKey] === 'object')
            );
            if (!hasDeletedAtInAnd && !hasNestedRelations) {
              args.where = {
                ...args.where,
                deletedAt: null,
              };
            }
          }
        }
        return query(args);
      },
    },
  },
});

/**
 * Models that support soft delete (have deletedAt field)
 */
const SOFT_DELETE_MODELS = [
  'User',
  'Project',
  'Building',
  'Floor',
  'Unit',
  'UnitType',
  'Reservation',
  'Booking',
  'Deposit',
  'PaymentSchedule',
  'Transaction',
  'Commission',
  'PaymentRequest',
  'SystemConfig',
  'PdfTemplate',
  'Notification',
];

/**
 * Check if model has deletedAt field
 */
function hasDeletedAtField(model: string): boolean {
  return SOFT_DELETE_MODELS.includes(model);
}


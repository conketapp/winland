export enum AssignmentStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export interface Assignment {
  id: string;
  propertyId: string;
  ctvId: string;
  assignedBy: string;
  status: AssignmentStatus;
  assignedAt: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAssignmentDto {
  propertyId: string;
  ctvId: string;
  notes?: string;
}

export interface UpdateAssignmentDto {
  status?: AssignmentStatus;
  notes?: string;
}


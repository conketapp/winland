/**
 * Custom hook for Project Form using React Hook Form
 * Handles form state, validation, and common logic
 */

import { useForm, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { projectFormSchema, type ProjectFormData } from '../schemas/project.schema';
import type { CreateProjectDto } from '../types/project.types';

// Re-export type for convenience
export type { ProjectFormData };

const defaultValues: ProjectFormData = {
  name: '',
  code: '',
  developer: '',
  location: '',
  address: '',
  district: '',
  city: '',
  totalBuildings: undefined,
  totalUnits: undefined,
  priceFrom: undefined,
  priceTo: undefined,
  commissionRate: undefined,
  description: '',
  images: [],
};

export function useProjectForm(initialData?: Partial<ProjectFormData>) {
  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      ...defaultValues,
      ...initialData,
      // Ensure numbers are properly initialized
      totalBuildings: initialData?.totalBuildings ?? undefined,
      totalUnits: initialData?.totalUnits ?? undefined,
      priceFrom: initialData?.priceFrom ?? undefined,
      priceTo: initialData?.priceTo ?? undefined,
      commissionRate: initialData?.commissionRate ?? undefined,
    },
    mode: 'onChange', // Validate on change for better UX
  });

  /**
   * Prepare payload for API (already normalized by Zod schema)
   */
  const preparePayload = (data?: ProjectFormData): CreateProjectDto => {
    const formData = data || form.getValues();
    return {
      name: formData.name,
      code: formData.code,
      developer: formData.developer,
      location: formData.location,
      address: formData.address,
      district: formData.district,
      city: formData.city,
      description: formData.description || undefined,
      images: formData.images && formData.images.length > 0 ? formData.images : undefined,
      totalBuildings: formData.totalBuildings,
      totalUnits: formData.totalUnits,
      priceFrom: formData.priceFrom,
      priceTo: formData.priceTo,
      commissionRate: formData.commissionRate,
    };
  };

  /**
   * Reset form to initial state
   */
  const resetForm = (data?: Partial<ProjectFormData>) => {
    form.reset({
      ...defaultValues,
      ...data,
    });
  };

  return {
    ...form,
    preparePayload,
    reset: resetForm,
  } as UseFormReturn<ProjectFormData> & {
    preparePayload: (data?: ProjectFormData) => Partial<CreateProjectDto>;
    reset: (data?: Partial<ProjectFormData>) => void;
  };
}

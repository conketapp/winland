/**
 * Projects API Service
 * All project-related API calls
 */

import { apiRequest } from './client';
import { API_ENDPOINTS } from '../constants/api';
import type { Project, CreateProjectDto, ProjectStatistics } from '../types/project.types';

export const projectsApi = {
  /**
   * Get all projects
   */
  getAll: async (params?: {
    status?: string;
    city?: string;
    search?: string;
  }): Promise<Project[]> => {
    return apiRequest<Project[]>({
      method: 'GET',
      url: API_ENDPOINTS.PROJECTS.BASE,
      params,
    });
  },

  /**
   * Get project by ID
   */
  getById: async (id: string): Promise<Project> => {
    return apiRequest<Project>({
      method: 'GET',
      url: API_ENDPOINTS.PROJECTS.BY_ID(id),
    });
  },

  /**
   * Create project
   */
  create: async (data: CreateProjectDto): Promise<Project> => {
    return apiRequest<Project>({
      method: 'POST',
      url: API_ENDPOINTS.PROJECTS.BASE,
      data,
    });
  },

  /**
   * Update project
   */
  update: async (id: string, data: Partial<CreateProjectDto>): Promise<Project> => {
    return apiRequest<Project>({
      method: 'PATCH',
      url: API_ENDPOINTS.PROJECTS.BY_ID(id),
      data,
    });
  },

  /**
   * Change project status (CRITICAL - triggers queue processing)
   */
  changeStatus: async (id: string, status: 'UPCOMING' | 'OPEN' | 'CLOSED'): Promise<Project> => {
    return apiRequest<Project>({
      method: 'PATCH',
      url: API_ENDPOINTS.PROJECTS.STATUS(id),
      data: { status },
    });
  },

  /**
   * Get project statistics
   */
  getStatistics: async (id: string): Promise<ProjectStatistics> => {
    return apiRequest<ProjectStatistics>({
      method: 'GET',
      url: API_ENDPOINTS.PROJECTS.STATISTICS(id),
    });
  },

  /**
   * Delete project
   */
  delete: async (id: string): Promise<{ message: string }> => {
    return apiRequest<{ message: string }>({
      method: 'DELETE',
      url: API_ENDPOINTS.PROJECTS.BY_ID(id),
    });
  },
};


import type { City, Department } from './user.types';

export interface ResolutionStep {
  id: string;
  order: number;
  title: string;
  description?: string | null;
}

export interface ResolutionProcess {
  id: string;
  name: string;
  categoryId: string;
  category?: { id: string; name: string; department?: Department };
  appliesToAllCities: boolean;
  cities: City[];
  steps: ResolutionStep[];
  isActive: boolean;
  createdAt: string;
}

export interface ComplaintResolutionStep {
  id: string;
  complaintId: string;
  processId?: string | null;
  order: number;
  title: string;
  description?: string | null;
  isCompleted: boolean;
  completedAt?: string | null;
  completedById?: string | null;
}

export interface ResolutionStepInput {
  title: string;
  description?: string;
}

export interface ResolutionProcessInput {
  name: string;
  categoryId: string;
  appliesToAllCities: boolean;
  cityIds?: string[];
  steps: ResolutionStepInput[];
  isActive?: boolean;
}

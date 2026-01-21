import type { Goal, Initiative, Deliverable } from '../types';

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }
  return response.json();
}

// Goals API
export const goalsApi = {
  fetchAll: async (): Promise<Goal[]> => {
    const response = await fetch('/api/notion/goals');
    return handleResponse<Goal[]>(response);
  },

  create: async (goal: Omit<Goal, 'id'>): Promise<Goal> => {
    const response = await fetch('/api/notion/goals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(goal),
    });
    return handleResponse<Goal>(response);
  },

  update: async (id: string, updates: Partial<Goal>): Promise<Goal> => {
    const response = await fetch(`/api/notion/goals/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return handleResponse<Goal>(response);
  },

  delete: async (id: string): Promise<void> => {
    const response = await fetch(`/api/notion/goals/${id}`, {
      method: 'DELETE',
    });
    await handleResponse<{ success: boolean }>(response);
  },
};

// Initiatives API
export const initiativesApi = {
  fetchAll: async (): Promise<Initiative[]> => {
    const response = await fetch('/api/notion/initiatives');
    return handleResponse<Initiative[]>(response);
  },

  create: async (initiative: Omit<Initiative, 'id'>): Promise<Initiative> => {
    const response = await fetch('/api/notion/initiatives', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(initiative),
    });
    return handleResponse<Initiative>(response);
  },

  update: async (id: string, updates: Partial<Initiative>): Promise<Initiative> => {
    const response = await fetch(`/api/notion/initiatives/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return handleResponse<Initiative>(response);
  },

  delete: async (id: string): Promise<void> => {
    const response = await fetch(`/api/notion/initiatives/${id}`, {
      method: 'DELETE',
    });
    await handleResponse<{ success: boolean }>(response);
  },
};

// Deliverables API
export const deliverablesApi = {
  fetchAll: async (): Promise<Deliverable[]> => {
    const response = await fetch('/api/notion/deliverables');
    return handleResponse<Deliverable[]>(response);
  },

  create: async (deliverable: Omit<Deliverable, 'id'>): Promise<Deliverable> => {
    const response = await fetch('/api/notion/deliverables', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(deliverable),
    });
    return handleResponse<Deliverable>(response);
  },

  update: async (id: string, updates: Partial<Deliverable>): Promise<Deliverable> => {
    const response = await fetch(`/api/notion/deliverables/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return handleResponse<Deliverable>(response);
  },

  delete: async (id: string): Promise<void> => {
    const response = await fetch(`/api/notion/deliverables/${id}`, {
      method: 'DELETE',
    });
    await handleResponse<{ success: boolean }>(response);
  },
};

// Fetch all data at once
export async function fetchAllData() {
  const [goals, initiatives, deliverables] = await Promise.all([
    goalsApi.fetchAll(),
    initiativesApi.fetchAll(),
    deliverablesApi.fetchAll(),
  ]);
  return { goals, initiatives, deliverables };
}

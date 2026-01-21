import { useCallback, useMemo } from 'react';
import type { Goal, Initiative, Deliverable } from '../types';

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }
  return response.json();
}

export function useNotionApi() {
  // Goals
  const fetchGoals = useCallback(async () => {
    const response = await fetch('/api/notion/goals');
    return handleResponse<Goal[]>(response);
  }, []);

  const createGoal = useCallback(async (goal: Omit<Goal, 'id'>) => {
    const response = await fetch('/api/notion/goals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(goal),
    });
    return handleResponse<Goal>(response);
  }, []);

  const updateGoal = useCallback(async (id: string, updates: Partial<Goal>) => {
    const response = await fetch(`/api/notion/goals/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return handleResponse<Goal>(response);
  }, []);

  const deleteGoal = useCallback(async (id: string) => {
    const response = await fetch(`/api/notion/goals/${id}`, {
      method: 'DELETE',
    });
    return handleResponse<{ success: boolean }>(response);
  }, []);

  // Initiatives
  const fetchInitiatives = useCallback(async () => {
    const response = await fetch('/api/notion/initiatives');
    return handleResponse<Initiative[]>(response);
  }, []);

  const createInitiative = useCallback(async (initiative: Omit<Initiative, 'id'>) => {
    const response = await fetch('/api/notion/initiatives', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(initiative),
    });
    return handleResponse<Initiative>(response);
  }, []);

  const updateInitiative = useCallback(async (id: string, updates: Partial<Initiative>) => {
    const response = await fetch(`/api/notion/initiatives/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return handleResponse<Initiative>(response);
  }, []);

  const deleteInitiative = useCallback(async (id: string) => {
    const response = await fetch(`/api/notion/initiatives/${id}`, {
      method: 'DELETE',
    });
    return handleResponse<{ success: boolean }>(response);
  }, []);

  // Deliverables
  const fetchDeliverables = useCallback(async () => {
    const response = await fetch('/api/notion/deliverables');
    return handleResponse<Deliverable[]>(response);
  }, []);

  const createDeliverable = useCallback(async (deliverable: Omit<Deliverable, 'id'>) => {
    const response = await fetch('/api/notion/deliverables', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(deliverable),
    });
    return handleResponse<Deliverable>(response);
  }, []);

  const updateDeliverable = useCallback(async (id: string, updates: Partial<Deliverable>) => {
    const response = await fetch(`/api/notion/deliverables/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return handleResponse<Deliverable>(response);
  }, []);

  const deleteDeliverable = useCallback(async (id: string) => {
    const response = await fetch(`/api/notion/deliverables/${id}`, {
      method: 'DELETE',
    });
    return handleResponse<{ success: boolean }>(response);
  }, []);

  // Fetch all data at once
  const fetchAllData = useCallback(async () => {
    const [goals, initiatives, deliverables] = await Promise.all([
      fetchGoals(),
      fetchInitiatives(),
      fetchDeliverables(),
    ]);
    return { goals, initiatives, deliverables };
  }, [fetchGoals, fetchInitiatives, fetchDeliverables]);

  return useMemo(() => ({
    fetchGoals,
    createGoal,
    updateGoal,
    deleteGoal,
    fetchInitiatives,
    createInitiative,
    updateInitiative,
    deleteInitiative,
    fetchDeliverables,
    createDeliverable,
    updateDeliverable,
    deleteDeliverable,
    fetchAllData,
  }), [
    fetchGoals,
    createGoal,
    updateGoal,
    deleteGoal,
    fetchInitiatives,
    createInitiative,
    updateInitiative,
    deleteInitiative,
    fetchDeliverables,
    createDeliverable,
    updateDeliverable,
    deleteDeliverable,
    fetchAllData,
  ]);
}

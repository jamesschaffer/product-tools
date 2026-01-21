import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  type ReactNode,
  type Dispatch,
} from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { Goal, Initiative, Deliverable, RoadmapSettings } from '../types';
import { queryKeys } from '../lib/queryClient';
import {
  useGoalsQuery,
  useCreateGoal,
  useUpdateGoal,
  useDeleteGoal,
} from '../hooks/useGoalsQuery';
import {
  useInitiativesQuery,
  useCreateInitiative,
  useUpdateInitiative,
  useDeleteInitiative,
} from '../hooks/useInitiativesQuery';
import {
  useDeliverablesQuery,
  useCreateDeliverable,
  useUpdateDeliverable,
  useDeleteDeliverable,
} from '../hooks/useDeliverablesQuery';
import {
  roadmapReducer,
  createInitialRoadmap,
  type RoadmapState,
  type RoadmapAction,
} from './roadmapReducer';

// Internal context - used by entity hooks
interface RoadmapContextInternal {
  state: RoadmapState;
  dispatch: Dispatch<RoadmapAction>;
  refreshData: () => Promise<void>;
}

const RoadmapContextInternal = createContext<RoadmapContextInternal | null>(null);

// Public hook for internal context (used by entity hooks)
export function useRoadmapContext() {
  const context = useContext(RoadmapContextInternal);
  if (!context) {
    throw new Error('useRoadmapContext must be used within a RoadmapProvider');
  }
  return context;
}

interface RoadmapProviderProps {
  children: ReactNode;
}

export function RoadmapProvider({ children }: RoadmapProviderProps) {
  const queryClient = useQueryClient();

  // TanStack Query hooks for data fetching
  const goalsQuery = useGoalsQuery();
  const initiativesQuery = useInitiativesQuery();
  const deliverablesQuery = useDeliverablesQuery();

  const [state, dispatch] = useReducer(roadmapReducer, {
    roadmap: createInitialRoadmap(),
    isLoading: true,
    error: null,
  });

  // Sync TanStack Query data to reducer state
  useEffect(() => {
    const isLoading = goalsQuery.isLoading || initiativesQuery.isLoading || deliverablesQuery.isLoading;
    const error = goalsQuery.error || initiativesQuery.error || deliverablesQuery.error;

    if (isLoading) {
      dispatch({ type: 'SET_LOADING', payload: true });
    } else if (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to load data' });
    } else if (goalsQuery.data && initiativesQuery.data && deliverablesQuery.data) {
      dispatch({
        type: 'LOAD_DATA',
        payload: {
          goals: goalsQuery.data,
          initiatives: initiativesQuery.data,
          deliverables: deliverablesQuery.data,
        },
      });
    }
  }, [
    goalsQuery.isLoading,
    goalsQuery.error,
    goalsQuery.data,
    initiativesQuery.isLoading,
    initiativesQuery.error,
    initiativesQuery.data,
    deliverablesQuery.isLoading,
    deliverablesQuery.error,
    deliverablesQuery.data,
  ]);

  const refreshData = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.all });
  }, [queryClient]);

  return (
    <RoadmapContextInternal.Provider value={{ state, dispatch, refreshData }}>
      {children}
    </RoadmapContextInternal.Provider>
  );
}

// Legacy compatibility hook - provides the full interface
export interface RoadmapContextValue {
  state: RoadmapState;
  addGoal: (goal: Omit<Goal, 'id' | 'order' | 'priority'>) => Promise<void>;
  updateGoal: (goal: Goal) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  setGoalPriority: (id: string, newPriority: number) => Promise<void>;
  addInitiative: (initiative: Omit<Initiative, 'id' | 'order'>) => Promise<void>;
  updateInitiative: (initiative: Initiative) => Promise<void>;
  deleteInitiative: (id: string) => Promise<void>;
  moveInitiative: (id: string, newGoalId: string) => Promise<void>;
  addDeliverable: (deliverable: Omit<Deliverable, 'id' | 'order'>) => Promise<void>;
  updateDeliverable: (deliverable: Deliverable) => Promise<void>;
  deleteDeliverable: (id: string) => Promise<void>;
  moveDeliverable: (id: string, newInitiativeId: string) => Promise<void>;
  updateSettings: (settings: Partial<RoadmapSettings>) => void;
  updateTitle: (title: string) => void;
  refreshData: () => Promise<void>;
}

export function useRoadmap(): RoadmapContextValue {
  const { state, dispatch, refreshData } = useRoadmapContext();

  // TanStack Query mutations
  const createGoalMutation = useCreateGoal();
  const updateGoalMutation = useUpdateGoal();
  const deleteGoalMutation = useDeleteGoal();
  const createInitiativeMutation = useCreateInitiative();
  const updateInitiativeMutation = useUpdateInitiative();
  const deleteInitiativeMutation = useDeleteInitiative();
  const createDeliverableMutation = useCreateDeliverable();
  const updateDeliverableMutation = useUpdateDeliverable();
  const deleteDeliverableMutation = useDeleteDeliverable();

  // Goal actions
  const addGoal = useCallback(async (goalData: Omit<Goal, 'id' | 'order' | 'priority'>) => {
    const newPriority = state.roadmap.goals.length + 1;
    const order = state.roadmap.goals.length;

    await createGoalMutation.mutateAsync({
      ...goalData,
      priority: newPriority,
      order,
    });
  }, [createGoalMutation, state.roadmap.goals.length]);

  const updateGoal = useCallback(async (goal: Goal) => {
    await updateGoalMutation.mutateAsync({ id: goal.id, updates: goal });
  }, [updateGoalMutation]);

  const deleteGoal = useCallback(async (id: string) => {
    // Get related items to delete
    const relatedInitiatives = state.roadmap.initiatives.filter((i) => i.goalId === id);
    const relatedDeliverables = state.roadmap.deliverables.filter(
      (d) => relatedInitiatives.some((i) => i.id === d.initiativeId)
    );

    // Delete in order: deliverables -> initiatives -> goal
    await Promise.all(relatedDeliverables.map((d) => deleteDeliverableMutation.mutateAsync(d.id)));
    await Promise.all(relatedInitiatives.map((i) => deleteInitiativeMutation.mutateAsync(i.id)));
    await deleteGoalMutation.mutateAsync(id);

    // Update priorities for remaining goals
    const deletedGoal = state.roadmap.goals.find((g) => g.id === id);
    if (deletedGoal) {
      const goalsToUpdate = state.roadmap.goals.filter(
        (g) => g.id !== id && g.priority > deletedGoal.priority
      );
      await Promise.all(
        goalsToUpdate.map((g) =>
          updateGoalMutation.mutateAsync({ id: g.id, updates: { priority: g.priority - 1 } })
        )
      );
    }
  }, [deleteGoalMutation, deleteInitiativeMutation, deleteDeliverableMutation, updateGoalMutation, state.roadmap]);

  const setGoalPriority = useCallback(async (id: string, newPriority: number) => {
    const goal = state.roadmap.goals.find((g) => g.id === id);
    if (!goal) return;

    const oldPriority = goal.priority;
    if (oldPriority === newPriority) return;

    const updates: Promise<unknown>[] = [
      updateGoalMutation.mutateAsync({ id, updates: { priority: newPriority } }),
    ];

    for (const g of state.roadmap.goals) {
      if (g.id === id) continue;

      if (newPriority < oldPriority) {
        if (g.priority >= newPriority && g.priority < oldPriority) {
          updates.push(
            updateGoalMutation.mutateAsync({ id: g.id, updates: { priority: g.priority + 1 } })
          );
        }
      } else {
        if (g.priority > oldPriority && g.priority <= newPriority) {
          updates.push(
            updateGoalMutation.mutateAsync({ id: g.id, updates: { priority: g.priority - 1 } })
          );
        }
      }
    }

    await Promise.all(updates);
  }, [updateGoalMutation, state.roadmap.goals]);

  // Initiative actions
  const addInitiative = useCallback(async (initiativeData: Omit<Initiative, 'id' | 'order'>) => {
    const order = state.roadmap.initiatives.filter((i) => i.goalId === initiativeData.goalId).length;
    await createInitiativeMutation.mutateAsync({ ...initiativeData, order });
  }, [createInitiativeMutation, state.roadmap.initiatives]);

  const updateInitiative = useCallback(async (initiative: Initiative) => {
    await updateInitiativeMutation.mutateAsync({ id: initiative.id, updates: initiative });
  }, [updateInitiativeMutation]);

  const deleteInitiative = useCallback(async (id: string) => {
    const relatedDeliverables = state.roadmap.deliverables.filter((d) => d.initiativeId === id);
    await Promise.all(relatedDeliverables.map((d) => deleteDeliverableMutation.mutateAsync(d.id)));
    await deleteInitiativeMutation.mutateAsync(id);
  }, [deleteInitiativeMutation, deleteDeliverableMutation, state.roadmap.deliverables]);

  const moveInitiative = useCallback(async (id: string, newGoalId: string) => {
    await updateInitiativeMutation.mutateAsync({ id, updates: { goalId: newGoalId } });
  }, [updateInitiativeMutation]);

  // Deliverable actions
  const addDeliverable = useCallback(async (deliverableData: Omit<Deliverable, 'id' | 'order'>) => {
    const order = state.roadmap.deliverables.filter(
      (d) => d.initiativeId === deliverableData.initiativeId
    ).length;
    await createDeliverableMutation.mutateAsync({ ...deliverableData, order });
  }, [createDeliverableMutation, state.roadmap.deliverables]);

  const updateDeliverable = useCallback(async (deliverable: Deliverable) => {
    await updateDeliverableMutation.mutateAsync({ id: deliverable.id, updates: deliverable });
  }, [updateDeliverableMutation]);

  const deleteDeliverable = useCallback(async (id: string) => {
    await deleteDeliverableMutation.mutateAsync(id);
  }, [deleteDeliverableMutation]);

  const moveDeliverable = useCallback(async (id: string, newInitiativeId: string) => {
    await updateDeliverableMutation.mutateAsync({ id, updates: { initiativeId: newInitiativeId } });
  }, [updateDeliverableMutation]);

  // Settings (local only)
  const updateSettings = useCallback((settings: Partial<RoadmapSettings>) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: settings });
  }, [dispatch]);

  const updateTitle = useCallback((title: string) => {
    dispatch({ type: 'UPDATE_TITLE', payload: title });
  }, [dispatch]);

  return {
    state,
    addGoal,
    updateGoal,
    deleteGoal,
    setGoalPriority,
    addInitiative,
    updateInitiative,
    deleteInitiative,
    moveInitiative,
    addDeliverable,
    updateDeliverable,
    deleteDeliverable,
    moveDeliverable,
    updateSettings,
    updateTitle,
    refreshData,
  };
}

export function useRoadmapData() {
  const { state } = useRoadmapContext();
  return state.roadmap;
}

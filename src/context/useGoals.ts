import { useCallback } from 'react';
import type { Goal } from '../types';
import { useRoadmapContext } from './RoadmapContext';
import { goalsApi, initiativesApi, deliverablesApi } from '../lib/api';

export function useGoals() {
  const { state, dispatch, refreshData } = useRoadmapContext();

  const goals = state.roadmap.goals;

  const addGoal = useCallback(async (goalData: Omit<Goal, 'id' | 'order' | 'priority'>) => {
    const newPriority = state.roadmap.goals.length + 1;
    const order = state.roadmap.goals.length;

    try {
      const created = await goalsApi.create({
        ...goalData,
        priority: newPriority,
        order,
      });
      dispatch({ type: 'ADD_GOAL', payload: created });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to create goal' });
      throw error;
    }
  }, [dispatch, state.roadmap.goals.length]);

  const updateGoal = useCallback(async (goal: Goal) => {
    dispatch({ type: 'UPDATE_GOAL', payload: goal });
    try {
      await goalsApi.update(goal.id, goal);
    } catch (error) {
      await refreshData();
      throw error;
    }
  }, [dispatch, refreshData]);

  const deleteGoal = useCallback(async (id: string) => {
    const relatedInitiatives = state.roadmap.initiatives.filter((i) => i.goalId === id);
    const relatedDeliverables = state.roadmap.deliverables.filter(
      (d) => relatedInitiatives.some((i) => i.id === d.initiativeId)
    );

    dispatch({ type: 'DELETE_GOAL', payload: id });

    try {
      await Promise.all(relatedDeliverables.map((d) => deliverablesApi.delete(d.id)));
      await Promise.all(relatedInitiatives.map((i) => initiativesApi.delete(i.id)));
      await goalsApi.delete(id);

      const remainingGoals = state.roadmap.goals.filter((g) => g.id !== id);
      const deletedGoal = state.roadmap.goals.find((g) => g.id === id);
      if (deletedGoal) {
        const goalsToUpdate = remainingGoals.filter((g) => g.priority > deletedGoal.priority);
        await Promise.all(
          goalsToUpdate.map((g) => goalsApi.update(g.id, { priority: g.priority - 1 }))
        );
      }
    } catch (error) {
      await refreshData();
      throw error;
    }
  }, [dispatch, refreshData, state.roadmap.initiatives, state.roadmap.deliverables, state.roadmap.goals]);

  const setGoalPriority = useCallback(async (id: string, newPriority: number) => {
    const goal = state.roadmap.goals.find((g) => g.id === id);
    if (!goal) return;

    const oldPriority = goal.priority;
    if (oldPriority === newPriority) return;

    dispatch({ type: 'SET_GOAL_PRIORITY', payload: { id, newPriority } });

    try {
      const updates: Promise<unknown>[] = [goalsApi.update(id, { priority: newPriority })];

      for (const g of state.roadmap.goals) {
        if (g.id === id) continue;

        if (newPriority < oldPriority) {
          if (g.priority >= newPriority && g.priority < oldPriority) {
            updates.push(goalsApi.update(g.id, { priority: g.priority + 1 }));
          }
        } else {
          if (g.priority > oldPriority && g.priority <= newPriority) {
            updates.push(goalsApi.update(g.id, { priority: g.priority - 1 }));
          }
        }
      }

      await Promise.all(updates);
    } catch (error) {
      await refreshData();
      throw error;
    }
  }, [dispatch, refreshData, state.roadmap.goals]);

  return {
    goals,
    addGoal,
    updateGoal,
    deleteGoal,
    setGoalPriority,
  };
}

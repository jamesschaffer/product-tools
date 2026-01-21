import { useCallback } from 'react';
import type { Initiative } from '../types';
import { useRoadmapContext } from './RoadmapContext';
import { initiativesApi, deliverablesApi } from '../lib/api';

export function useInitiatives() {
  const { state, dispatch, refreshData } = useRoadmapContext();

  const initiatives = state.roadmap.initiatives;

  const addInitiative = useCallback(async (initiativeData: Omit<Initiative, 'id' | 'order'>) => {
    const order = state.roadmap.initiatives.filter((i) => i.goalId === initiativeData.goalId).length;

    try {
      const created = await initiativesApi.create({ ...initiativeData, order });
      dispatch({ type: 'ADD_INITIATIVE', payload: created });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to create initiative' });
      throw error;
    }
  }, [dispatch, state.roadmap.initiatives]);

  const updateInitiative = useCallback(async (initiative: Initiative) => {
    dispatch({ type: 'UPDATE_INITIATIVE', payload: initiative });
    try {
      await initiativesApi.update(initiative.id, initiative);
    } catch (error) {
      await refreshData();
      throw error;
    }
  }, [dispatch, refreshData]);

  const deleteInitiative = useCallback(async (id: string) => {
    const relatedDeliverables = state.roadmap.deliverables.filter((d) => d.initiativeId === id);

    dispatch({ type: 'DELETE_INITIATIVE', payload: id });

    try {
      await Promise.all(relatedDeliverables.map((d) => deliverablesApi.delete(d.id)));
      await initiativesApi.delete(id);
    } catch (error) {
      await refreshData();
      throw error;
    }
  }, [dispatch, refreshData, state.roadmap.deliverables]);

  const moveInitiative = useCallback(async (id: string, newGoalId: string) => {
    dispatch({ type: 'MOVE_INITIATIVE', payload: { id, newGoalId } });
    try {
      await initiativesApi.update(id, { goalId: newGoalId });
    } catch (error) {
      await refreshData();
      throw error;
    }
  }, [dispatch, refreshData]);

  return {
    initiatives,
    addInitiative,
    updateInitiative,
    deleteInitiative,
    moveInitiative,
  };
}

import { useCallback } from 'react';
import type { Initiative } from '../types';
import { useRoadmapContext } from './RoadmapContext';
import { useNotionApi } from '../hooks/useNotionApi';

export function useInitiatives() {
  const { state, dispatch, refreshData } = useRoadmapContext();
  const api = useNotionApi();

  const initiatives = state.roadmap.initiatives;

  const addInitiative = useCallback(async (initiativeData: Omit<Initiative, 'id' | 'order'>) => {
    const order = state.roadmap.initiatives.filter((i) => i.goalId === initiativeData.goalId).length;

    try {
      const created = await api.createInitiative({ ...initiativeData, order });
      dispatch({ type: 'ADD_INITIATIVE', payload: created });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to create initiative' });
      throw error;
    }
  }, [api, dispatch, state.roadmap.initiatives]);

  const updateInitiative = useCallback(async (initiative: Initiative) => {
    dispatch({ type: 'UPDATE_INITIATIVE', payload: initiative });
    try {
      await api.updateInitiative(initiative.id, initiative);
    } catch (error) {
      await refreshData();
      throw error;
    }
  }, [api, dispatch, refreshData]);

  const deleteInitiative = useCallback(async (id: string) => {
    const relatedDeliverables = state.roadmap.deliverables.filter((d) => d.initiativeId === id);

    dispatch({ type: 'DELETE_INITIATIVE', payload: id });

    try {
      await Promise.all(relatedDeliverables.map((d) => api.deleteDeliverable(d.id)));
      await api.deleteInitiative(id);
    } catch (error) {
      await refreshData();
      throw error;
    }
  }, [api, dispatch, refreshData, state.roadmap.deliverables]);

  const moveInitiative = useCallback(async (id: string, newGoalId: string) => {
    dispatch({ type: 'MOVE_INITIATIVE', payload: { id, newGoalId } });
    try {
      await api.updateInitiative(id, { goalId: newGoalId });
    } catch (error) {
      await refreshData();
      throw error;
    }
  }, [api, dispatch, refreshData]);

  return {
    initiatives,
    addInitiative,
    updateInitiative,
    deleteInitiative,
    moveInitiative,
  };
}

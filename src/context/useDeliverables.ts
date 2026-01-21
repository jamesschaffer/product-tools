import { useCallback } from 'react';
import type { Deliverable } from '../types';
import { useRoadmapContext } from './RoadmapContext';
import { useNotionApi } from '../hooks/useNotionApi';

export function useDeliverables() {
  const { state, dispatch, refreshData } = useRoadmapContext();
  const api = useNotionApi();

  const deliverables = state.roadmap.deliverables;

  const addDeliverable = useCallback(async (deliverableData: Omit<Deliverable, 'id' | 'order'>) => {
    const order = state.roadmap.deliverables.filter((d) => d.initiativeId === deliverableData.initiativeId).length;

    try {
      const created = await api.createDeliverable({ ...deliverableData, order });
      dispatch({ type: 'ADD_DELIVERABLE', payload: created });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to create deliverable' });
      throw error;
    }
  }, [api, dispatch, state.roadmap.deliverables]);

  const updateDeliverable = useCallback(async (deliverable: Deliverable) => {
    dispatch({ type: 'UPDATE_DELIVERABLE', payload: deliverable });
    try {
      await api.updateDeliverable(deliverable.id, deliverable);
    } catch (error) {
      await refreshData();
      throw error;
    }
  }, [api, dispatch, refreshData]);

  const deleteDeliverable = useCallback(async (id: string) => {
    dispatch({ type: 'DELETE_DELIVERABLE', payload: id });
    try {
      await api.deleteDeliverable(id);
    } catch (error) {
      await refreshData();
      throw error;
    }
  }, [api, dispatch, refreshData]);

  const moveDeliverable = useCallback(async (id: string, newInitiativeId: string) => {
    dispatch({ type: 'MOVE_DELIVERABLE', payload: { id, newInitiativeId } });
    try {
      await api.updateDeliverable(id, { initiativeId: newInitiativeId });
    } catch (error) {
      await refreshData();
      throw error;
    }
  }, [api, dispatch, refreshData]);

  return {
    deliverables,
    addDeliverable,
    updateDeliverable,
    deleteDeliverable,
    moveDeliverable,
  };
}

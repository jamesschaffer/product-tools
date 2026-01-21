import { useCallback } from 'react';
import type { Deliverable } from '../types';
import { useRoadmapContext } from './RoadmapContext';
import { deliverablesApi } from '../lib/api';

export function useDeliverables() {
  const { state, dispatch, refreshData } = useRoadmapContext();

  const deliverables = state.roadmap.deliverables;

  const addDeliverable = useCallback(async (deliverableData: Omit<Deliverable, 'id' | 'order'>) => {
    const order = state.roadmap.deliverables.filter((d) => d.initiativeId === deliverableData.initiativeId).length;

    try {
      const created = await deliverablesApi.create({ ...deliverableData, order });
      dispatch({ type: 'ADD_DELIVERABLE', payload: created });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to create deliverable' });
      throw error;
    }
  }, [dispatch, state.roadmap.deliverables]);

  const updateDeliverable = useCallback(async (deliverable: Deliverable) => {
    dispatch({ type: 'UPDATE_DELIVERABLE', payload: deliverable });
    try {
      await deliverablesApi.update(deliverable.id, deliverable);
    } catch (error) {
      await refreshData();
      throw error;
    }
  }, [dispatch, refreshData]);

  const deleteDeliverable = useCallback(async (id: string) => {
    dispatch({ type: 'DELETE_DELIVERABLE', payload: id });
    try {
      await deliverablesApi.delete(id);
    } catch (error) {
      await refreshData();
      throw error;
    }
  }, [dispatch, refreshData]);

  const moveDeliverable = useCallback(async (id: string, newInitiativeId: string) => {
    dispatch({ type: 'MOVE_DELIVERABLE', payload: { id, newInitiativeId } });
    try {
      await deliverablesApi.update(id, { initiativeId: newInitiativeId });
    } catch (error) {
      await refreshData();
      throw error;
    }
  }, [dispatch, refreshData]);

  return {
    deliverables,
    addDeliverable,
    updateDeliverable,
    deleteDeliverable,
    moveDeliverable,
  };
}

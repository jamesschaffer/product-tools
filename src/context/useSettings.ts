import { useCallback } from 'react';
import type { RoadmapSettings } from '../types';
import { useRoadmapContext } from './RoadmapContext';

export function useSettings() {
  const { state, dispatch } = useRoadmapContext();

  const settings = state.roadmap.settings;
  const title = state.roadmap.title;

  const updateSettings = useCallback((newSettings: Partial<RoadmapSettings>) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: newSettings });
  }, [dispatch]);

  const updateTitle = useCallback((newTitle: string) => {
    dispatch({ type: 'UPDATE_TITLE', payload: newTitle });
  }, [dispatch]);

  return {
    settings,
    title,
    updateSettings,
    updateTitle,
  };
}

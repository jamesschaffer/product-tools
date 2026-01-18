import { useState } from 'react';
import { useRoadmap } from '../../context';
import { Button, Modal } from '../ui';
import { ThemeForm } from './ThemeForm';
import { ThemeItem } from './ThemeItem';
import type { Theme, Initiative, Feature, FeatureStatus } from '../../types';

export function EditView() {
  const { state, dispatch } = useRoadmap();
  const { roadmap } = state;
  const [isAddingTheme, setIsAddingTheme] = useState(false);

  const sortedThemes = [...roadmap.themes].sort((a, b) => a.order - b.order);

  const getThemeInitiatives = (themeId: string) => {
    return roadmap.initiatives
      .filter((i) => i.themeId === themeId)
      .sort((a, b) => a.order - b.order);
  };

  const getThemeFeatures = (themeId: string) => {
    const initiativeIds = getThemeInitiatives(themeId).map((i) => i.id);
    return roadmap.features.filter((f) => initiativeIds.includes(f.initiativeId));
  };

  const handleAddTheme = (data: { name: string; description?: string; desiredOutcome: string }) => {
    dispatch({ type: 'ADD_THEME', payload: data });
    setIsAddingTheme(false);
  };

  const handleUpdateTheme = (theme: Theme) => {
    dispatch({ type: 'UPDATE_THEME', payload: theme });
  };

  const handleDeleteTheme = (id: string) => {
    dispatch({ type: 'DELETE_THEME', payload: id });
  };

  const handleAddInitiative = (themeId: string, data: { name: string; idealOutcome: string }) => {
    dispatch({ type: 'ADD_INITIATIVE', payload: { ...data, themeId } });
  };

  const handleUpdateInitiative = (initiative: Initiative) => {
    dispatch({ type: 'UPDATE_INITIATIVE', payload: initiative });
  };

  const handleDeleteInitiative = (id: string) => {
    dispatch({ type: 'DELETE_INITIATIVE', payload: id });
  };

  const handleAddFeature = (
    initiativeId: string,
    data: {
      name: string;
      description?: string;
      status: FeatureStatus;
      startDate?: string;
      endDate?: string;
    }
  ) => {
    dispatch({ type: 'ADD_FEATURE', payload: { ...data, initiativeId } });
  };

  const handleUpdateFeature = (feature: Feature) => {
    dispatch({ type: 'UPDATE_FEATURE', payload: feature });
  };

  const handleDeleteFeature = (id: string) => {
    dispatch({ type: 'DELETE_FEATURE', payload: id });
  };

  if (state.isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium text-gray-900">Edit Roadmap</h2>
          <p className="text-sm text-gray-500">
            Manage themes, initiatives, and features
          </p>
        </div>
        <Button variant="primary" onClick={() => setIsAddingTheme(true)}>
          + Add Theme
        </Button>
      </div>

      {sortedThemes.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
          <p className="text-gray-500">No themes yet</p>
          <p className="text-sm text-gray-400 mt-1">
            Start by adding a theme to organize your roadmap
          </p>
          <Button
            variant="primary"
            onClick={() => setIsAddingTheme(true)}
            className="mt-4"
          >
            Add Your First Theme
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedThemes.map((theme) => (
            <ThemeItem
              key={theme.id}
              theme={theme}
              initiatives={getThemeInitiatives(theme.id)}
              features={getThemeFeatures(theme.id)}
              onUpdate={handleUpdateTheme}
              onDelete={handleDeleteTheme}
              onAddInitiative={(data) => handleAddInitiative(theme.id, data)}
              onUpdateInitiative={handleUpdateInitiative}
              onDeleteInitiative={handleDeleteInitiative}
              onAddFeature={handleAddFeature}
              onUpdateFeature={handleUpdateFeature}
              onDeleteFeature={handleDeleteFeature}
            />
          ))}
        </div>
      )}

      <Modal
        isOpen={isAddingTheme}
        onClose={() => setIsAddingTheme(false)}
        title="Add Theme"
      >
        <ThemeForm
          onSubmit={handleAddTheme}
          onCancel={() => setIsAddingTheme(false)}
        />
      </Modal>
    </div>
  );
}

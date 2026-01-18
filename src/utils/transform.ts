import type {
  Roadmap,
  ThemeWithChildren,
  InitiativeWithChildren,
} from '../types';

export function buildNestedStructure(roadmap: Roadmap): ThemeWithChildren[] {
  const sortedThemes = [...roadmap.themes].sort((a, b) => a.order - b.order);

  return sortedThemes.map((theme) => {
    const themeInitiatives = roadmap.initiatives
      .filter((i) => i.themeId === theme.id)
      .sort((a, b) => a.order - b.order);

    const initiativesWithFeatures: InitiativeWithChildren[] = themeInitiatives.map(
      (initiative) => {
        const features = roadmap.features
          .filter((f) => f.initiativeId === initiative.id)
          .sort((a, b) => a.order - b.order);

        return {
          ...initiative,
          features,
        };
      }
    );

    return {
      ...theme,
      initiatives: initiativesWithFeatures,
    };
  });
}

export function getFeaturesByStatus(roadmap: Roadmap) {
  const shipped = roadmap.features.filter((f) => f.status === 'shipped').length;
  const inProgress = roadmap.features.filter((f) => f.status === 'in-progress').length;
  const planned = roadmap.features.filter((f) => f.status === 'planned').length;

  return { shipped, inProgress, planned, total: roadmap.features.length };
}

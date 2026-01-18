import type { Feature, Roadmap, Theme, Initiative } from '../types';

export interface StackedFeature extends Feature {
  stackIndex: number;
}

export function calculateFeatureStacking(features: Feature[]): StackedFeature[] {
  const scheduled = features.filter((f) => f.startDate && f.endDate);
  const sorted = [...scheduled].sort(
    (a, b) => new Date(a.startDate!).getTime() - new Date(b.startDate!).getTime()
  );

  const stacked: StackedFeature[] = [];
  const rows: { endDate: Date }[] = [];

  for (const feature of sorted) {
    const start = new Date(feature.startDate!);

    let rowIndex = rows.findIndex((row) => row.endDate <= start);

    if (rowIndex === -1) {
      rowIndex = rows.length;
      rows.push({ endDate: new Date(feature.endDate!) });
    } else {
      rows[rowIndex].endDate = new Date(feature.endDate!);
    }

    stacked.push({ ...feature, stackIndex: rowIndex });
  }

  return stacked;
}

export interface GanttRowData {
  theme: Theme;
  initiative: Initiative;
  scheduledFeatures: StackedFeature[];
  unscheduledFeatures: Feature[];
  maxStackIndex: number;
  isFirstInitiativeInTheme: boolean;
  initiativeCountInTheme: number;
}

export function buildGanttRows(roadmap: Roadmap): GanttRowData[] {
  const rows: GanttRowData[] = [];

  const sortedThemes = [...roadmap.themes].sort((a, b) => a.order - b.order);

  for (const theme of sortedThemes) {
    const themeInitiatives = roadmap.initiatives
      .filter((i) => i.themeId === theme.id)
      .sort((a, b) => a.order - b.order);

    themeInitiatives.forEach((initiative, index) => {
      const initiativeFeatures = roadmap.features
        .filter((f) => f.initiativeId === initiative.id)
        .sort((a, b) => a.order - b.order);

      const scheduled = initiativeFeatures.filter((f) => f.startDate && f.endDate);
      const unscheduled = initiativeFeatures.filter((f) => !f.startDate || !f.endDate);

      const stackedFeatures = calculateFeatureStacking(scheduled);
      const maxStackIndex = stackedFeatures.reduce(
        (max, f) => Math.max(max, f.stackIndex),
        -1
      );

      rows.push({
        theme,
        initiative,
        scheduledFeatures: stackedFeatures,
        unscheduledFeatures: unscheduled,
        maxStackIndex,
        isFirstInitiativeInTheme: index === 0,
        initiativeCountInTheme: themeInitiatives.length,
      });
    });

    if (themeInitiatives.length === 0) {
      rows.push({
        theme,
        initiative: {
          id: `empty-${theme.id}`,
          themeId: theme.id,
          name: 'No initiatives',
          idealOutcome: '',
          order: 0,
        },
        scheduledFeatures: [],
        unscheduledFeatures: [],
        maxStackIndex: -1,
        isFirstInitiativeInTheme: true,
        initiativeCountInTheme: 0,
      });
    }
  }

  return rows;
}

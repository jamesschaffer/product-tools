export type FeatureStatus = 'shipped' | 'in-progress' | 'planned';

export interface Feature {
  id: string;
  initiativeId: string;
  name: string;
  description?: string;
  status: FeatureStatus;
  startDate?: string;
  endDate?: string;
  order: number;
}

export interface Initiative {
  id: string;
  themeId: string;
  name: string;
  idealOutcome: string;
  order: number;
}

export interface Theme {
  id: string;
  name: string;
  description?: string;
  desiredOutcome: string;
  order: number;
}

export type ColorTheme = 'blue' | 'green' | 'orange' | 'purple' | 'red' | 'teal' | 'slate';

export interface RoadmapSettings {
  viewStartDate: string;
  colorTheme: ColorTheme;
  fontFamily: string;
}

export interface Roadmap {
  id: string;
  title: string;
  themes: Theme[];
  initiatives: Initiative[];
  features: Feature[];
  settings: RoadmapSettings;
  createdAt: string;
  updatedAt: string;
}

export interface ThemeWithChildren extends Theme {
  initiatives: InitiativeWithChildren[];
}

export interface InitiativeWithChildren extends Initiative {
  features: Feature[];
}

export interface GanttRow {
  theme: Theme;
  initiative: Initiative;
  scheduledFeatures: Feature[];
  unscheduledFeatures: Feature[];
}

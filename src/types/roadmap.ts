export type DeliverableStatus = 'shipped' | 'in-progress' | 'planned';

export interface Deliverable {
  id: string;
  initiativeId: string;
  name: string;
  description?: string;
  status: DeliverableStatus;
  startDate?: string;
  endDate?: string;
  order: number;
}

export interface Initiative {
  id: string;
  goalId: string;
  name: string;
  idealOutcome: string;
  order: number;
}

export interface Goal {
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
  goals: Goal[];
  initiatives: Initiative[];
  deliverables: Deliverable[];
  settings: RoadmapSettings;
  createdAt: string;
  updatedAt: string;
}

export interface GoalWithChildren extends Goal {
  initiatives: InitiativeWithChildren[];
}

export interface InitiativeWithChildren extends Initiative {
  deliverables: Deliverable[];
}

export interface GanttRow {
  goal: Goal;
  initiative: Initiative;
  scheduledDeliverables: Deliverable[];
  unscheduledDeliverables: Deliverable[];
}

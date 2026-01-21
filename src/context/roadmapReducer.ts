import type { Roadmap, Goal, Initiative, Deliverable, RoadmapSettings } from '../types';

export interface RoadmapState {
  roadmap: Roadmap;
  isLoading: boolean;
  error: string | null;
}

export type RoadmapAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'LOAD_DATA'; payload: { goals: Goal[]; initiatives: Initiative[]; deliverables: Deliverable[] } }
  | { type: 'ADD_GOAL'; payload: Goal }
  | { type: 'UPDATE_GOAL'; payload: Goal }
  | { type: 'DELETE_GOAL'; payload: string }
  | { type: 'SET_GOAL_PRIORITY'; payload: { id: string; newPriority: number } }
  | { type: 'ADD_INITIATIVE'; payload: Initiative }
  | { type: 'UPDATE_INITIATIVE'; payload: Initiative }
  | { type: 'DELETE_INITIATIVE'; payload: string }
  | { type: 'MOVE_INITIATIVE'; payload: { id: string; newGoalId: string } }
  | { type: 'ADD_DELIVERABLE'; payload: Deliverable }
  | { type: 'UPDATE_DELIVERABLE'; payload: Deliverable }
  | { type: 'DELETE_DELIVERABLE'; payload: string }
  | { type: 'MOVE_DELIVERABLE'; payload: { id: string; newInitiativeId: string } }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<RoadmapSettings> }
  | { type: 'UPDATE_TITLE'; payload: string };

export function createInitialRoadmap(): Roadmap {
  const now = new Date().toISOString();
  return {
    id: 'notion-roadmap',
    title: 'Product Roadmap',
    goals: [],
    initiatives: [],
    deliverables: [],
    settings: {
      colorTheme: 'blue',
      fontFamily: 'system-ui',
    },
    createdAt: now,
    updatedAt: now,
  };
}

export function roadmapReducer(state: RoadmapState, action: RoadmapAction): RoadmapState {
  const updateRoadmap = (updates: Partial<Roadmap>): RoadmapState => ({
    ...state,
    roadmap: {
      ...state.roadmap,
      ...updates,
      updatedAt: new Date().toISOString(),
    },
  });

  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };

    case 'LOAD_DATA':
      return {
        ...state,
        isLoading: false,
        error: null,
        roadmap: {
          ...state.roadmap,
          goals: action.payload.goals,
          initiatives: action.payload.initiatives,
          deliverables: action.payload.deliverables,
        },
      };

    case 'ADD_GOAL':
      return updateRoadmap({
        goals: [...state.roadmap.goals, action.payload],
      });

    case 'UPDATE_GOAL':
      return updateRoadmap({
        goals: state.roadmap.goals.map((g) =>
          g.id === action.payload.id ? action.payload : g
        ),
      });

    case 'DELETE_GOAL': {
      const deletedGoal = state.roadmap.goals.find((g) => g.id === action.payload);
      if (!deletedGoal) return state;

      const deletedPriority = deletedGoal.priority;
      const updatedGoals = state.roadmap.goals
        .filter((g) => g.id !== action.payload)
        .map((g) => ({
          ...g,
          priority: g.priority > deletedPriority ? g.priority - 1 : g.priority,
        }));

      const deletedInitiativeIds = state.roadmap.initiatives
        .filter((i) => i.goalId === action.payload)
        .map((i) => i.id);

      return updateRoadmap({
        goals: updatedGoals,
        initiatives: state.roadmap.initiatives.filter((i) => i.goalId !== action.payload),
        deliverables: state.roadmap.deliverables.filter(
          (d) => !deletedInitiativeIds.includes(d.initiativeId)
        ),
      });
    }

    case 'SET_GOAL_PRIORITY': {
      const { id, newPriority } = action.payload;
      const goal = state.roadmap.goals.find((g) => g.id === id);
      if (!goal) return state;

      const oldPriority = goal.priority;
      if (oldPriority === newPriority) return state;

      const updatedGoals = state.roadmap.goals.map((g) => {
        if (g.id === id) {
          return { ...g, priority: newPriority };
        }
        if (newPriority < oldPriority) {
          if (g.priority >= newPriority && g.priority < oldPriority) {
            return { ...g, priority: g.priority + 1 };
          }
        } else {
          if (g.priority > oldPriority && g.priority <= newPriority) {
            return { ...g, priority: g.priority - 1 };
          }
        }
        return g;
      });

      return updateRoadmap({ goals: updatedGoals });
    }

    case 'ADD_INITIATIVE':
      return updateRoadmap({
        initiatives: [...state.roadmap.initiatives, action.payload],
      });

    case 'UPDATE_INITIATIVE':
      return updateRoadmap({
        initiatives: state.roadmap.initiatives.map((i) =>
          i.id === action.payload.id ? action.payload : i
        ),
      });

    case 'DELETE_INITIATIVE':
      return updateRoadmap({
        initiatives: state.roadmap.initiatives.filter((i) => i.id !== action.payload),
        deliverables: state.roadmap.deliverables.filter((d) => d.initiativeId !== action.payload),
      });

    case 'MOVE_INITIATIVE':
      return updateRoadmap({
        initiatives: state.roadmap.initiatives.map((i) =>
          i.id === action.payload.id
            ? { ...i, goalId: action.payload.newGoalId }
            : i
        ),
      });

    case 'ADD_DELIVERABLE':
      return updateRoadmap({
        deliverables: [...state.roadmap.deliverables, action.payload],
      });

    case 'UPDATE_DELIVERABLE':
      return updateRoadmap({
        deliverables: state.roadmap.deliverables.map((d) =>
          d.id === action.payload.id ? action.payload : d
        ),
      });

    case 'DELETE_DELIVERABLE':
      return updateRoadmap({
        deliverables: state.roadmap.deliverables.filter((d) => d.id !== action.payload),
      });

    case 'MOVE_DELIVERABLE':
      return updateRoadmap({
        deliverables: state.roadmap.deliverables.map((d) =>
          d.id === action.payload.id
            ? { ...d, initiativeId: action.payload.newInitiativeId }
            : d
        ),
      });

    case 'UPDATE_SETTINGS':
      return updateRoadmap({
        settings: { ...state.roadmap.settings, ...action.payload },
      });

    case 'UPDATE_TITLE':
      return updateRoadmap({ title: action.payload });

    default:
      return state;
  }
}

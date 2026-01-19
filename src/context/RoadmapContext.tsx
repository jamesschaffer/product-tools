import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  type ReactNode,
} from 'react';
import type {
  Roadmap,
  Goal,
  Initiative,
  Deliverable,
  RoadmapSettings,
} from '../types';
import { generateId, saveRoadmap, loadRoadmap, getNextQuarterStart, formatDateISO } from '../utils';
import { sampleRoadmap } from '../data';

interface RoadmapState {
  roadmap: Roadmap;
  isLoading: boolean;
}

type RoadmapAction =
  | { type: 'ADD_GOAL'; payload: Omit<Goal, 'id' | 'order'> }
  | { type: 'UPDATE_GOAL'; payload: Goal }
  | { type: 'DELETE_GOAL'; payload: string }
  | { type: 'REORDER_GOALS'; payload: string[] }
  | { type: 'ADD_INITIATIVE'; payload: Omit<Initiative, 'id' | 'order'> }
  | { type: 'UPDATE_INITIATIVE'; payload: Initiative }
  | { type: 'DELETE_INITIATIVE'; payload: string }
  | { type: 'MOVE_INITIATIVE'; payload: { id: string; newGoalId: string } }
  | { type: 'REORDER_INITIATIVES'; payload: { goalId: string; initiativeIds: string[] } }
  | { type: 'ADD_DELIVERABLE'; payload: Omit<Deliverable, 'id' | 'order'> }
  | { type: 'UPDATE_DELIVERABLE'; payload: Deliverable }
  | { type: 'DELETE_DELIVERABLE'; payload: string }
  | { type: 'MOVE_DELIVERABLE'; payload: { id: string; newInitiativeId: string } }
  | { type: 'REORDER_DELIVERABLES'; payload: { initiativeId: string; deliverableIds: string[] } }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<RoadmapSettings> }
  | { type: 'UPDATE_TITLE'; payload: string }
  | { type: 'LOAD_ROADMAP'; payload: Roadmap }
  | { type: 'RESET_ROADMAP' }
  | { type: 'IMPORT_ROADMAP'; payload: Roadmap };

function createInitialRoadmap(): Roadmap {
  const now = new Date().toISOString();
  return {
    id: generateId(),
    title: 'Product Roadmap',
    goals: [],
    initiatives: [],
    deliverables: [],
    settings: {
      viewStartDate: formatDateISO(getNextQuarterStart(new Date())),
      colorTheme: 'blue',
      fontFamily: 'system-ui',
    },
    createdAt: now,
    updatedAt: now,
  };
}

function roadmapReducer(state: RoadmapState, action: RoadmapAction): RoadmapState {
  const updateRoadmap = (updates: Partial<Roadmap>): RoadmapState => ({
    ...state,
    roadmap: {
      ...state.roadmap,
      ...updates,
      updatedAt: new Date().toISOString(),
    },
  });

  switch (action.type) {
    case 'ADD_GOAL': {
      const newGoal: Goal = {
        ...action.payload,
        id: generateId(),
        order: state.roadmap.goals.length,
      };
      return updateRoadmap({
        goals: [...state.roadmap.goals, newGoal],
      });
    }

    case 'UPDATE_GOAL': {
      return updateRoadmap({
        goals: state.roadmap.goals.map((g) =>
          g.id === action.payload.id ? action.payload : g
        ),
      });
    }

    case 'DELETE_GOAL': {
      return updateRoadmap({
        goals: state.roadmap.goals.filter((g) => g.id !== action.payload),
      });
    }

    case 'REORDER_GOALS': {
      const reordered = action.payload.map((id, index) => {
        const goal = state.roadmap.goals.find((g) => g.id === id);
        return goal ? { ...goal, order: index } : null;
      }).filter((g): g is Goal => g !== null);
      return updateRoadmap({ goals: reordered });
    }

    case 'ADD_INITIATIVE': {
      const initiativesInGoal = state.roadmap.initiatives.filter(
        (i) => i.goalId === action.payload.goalId
      );
      const newInitiative: Initiative = {
        ...action.payload,
        id: generateId(),
        order: initiativesInGoal.length,
      };
      return updateRoadmap({
        initiatives: [...state.roadmap.initiatives, newInitiative],
      });
    }

    case 'UPDATE_INITIATIVE': {
      return updateRoadmap({
        initiatives: state.roadmap.initiatives.map((i) =>
          i.id === action.payload.id ? action.payload : i
        ),
      });
    }

    case 'DELETE_INITIATIVE': {
      return updateRoadmap({
        initiatives: state.roadmap.initiatives.filter((i) => i.id !== action.payload),
      });
    }

    case 'MOVE_INITIATIVE': {
      return updateRoadmap({
        initiatives: state.roadmap.initiatives.map((i) =>
          i.id === action.payload.id
            ? { ...i, goalId: action.payload.newGoalId }
            : i
        ),
      });
    }

    case 'REORDER_INITIATIVES': {
      const { goalId, initiativeIds } = action.payload;
      const otherInitiatives = state.roadmap.initiatives.filter(
        (i) => i.goalId !== goalId
      );
      const reordered = initiativeIds.map((id, index) => {
        const initiative = state.roadmap.initiatives.find((i) => i.id === id);
        return initiative ? { ...initiative, order: index } : null;
      }).filter((i): i is Initiative => i !== null);
      return updateRoadmap({
        initiatives: [...otherInitiatives, ...reordered],
      });
    }

    case 'ADD_DELIVERABLE': {
      const deliverablesInInitiative = state.roadmap.deliverables.filter(
        (d) => d.initiativeId === action.payload.initiativeId
      );
      const newDeliverable: Deliverable = {
        ...action.payload,
        id: generateId(),
        order: deliverablesInInitiative.length,
      };
      return updateRoadmap({
        deliverables: [...state.roadmap.deliverables, newDeliverable],
      });
    }

    case 'UPDATE_DELIVERABLE': {
      return updateRoadmap({
        deliverables: state.roadmap.deliverables.map((d) =>
          d.id === action.payload.id ? action.payload : d
        ),
      });
    }

    case 'DELETE_DELIVERABLE': {
      return updateRoadmap({
        deliverables: state.roadmap.deliverables.filter((d) => d.id !== action.payload),
      });
    }

    case 'MOVE_DELIVERABLE': {
      return updateRoadmap({
        deliverables: state.roadmap.deliverables.map((d) =>
          d.id === action.payload.id
            ? { ...d, initiativeId: action.payload.newInitiativeId }
            : d
        ),
      });
    }

    case 'REORDER_DELIVERABLES': {
      const { initiativeId, deliverableIds } = action.payload;
      const otherDeliverables = state.roadmap.deliverables.filter(
        (d) => d.initiativeId !== initiativeId
      );
      const reordered = deliverableIds.map((id, index) => {
        const deliverable = state.roadmap.deliverables.find((d) => d.id === id);
        return deliverable ? { ...deliverable, order: index } : null;
      }).filter((d): d is Deliverable => d !== null);
      return updateRoadmap({
        deliverables: [...otherDeliverables, ...reordered],
      });
    }

    case 'UPDATE_SETTINGS': {
      return updateRoadmap({
        settings: { ...state.roadmap.settings, ...action.payload },
      });
    }

    case 'UPDATE_TITLE': {
      return updateRoadmap({ title: action.payload });
    }

    case 'LOAD_ROADMAP': {
      return { ...state, roadmap: action.payload, isLoading: false };
    }

    case 'RESET_ROADMAP': {
      return { ...state, roadmap: createInitialRoadmap() };
    }

    case 'IMPORT_ROADMAP': {
      return { ...state, roadmap: action.payload };
    }

    default:
      return state;
  }
}

interface RoadmapContextValue {
  state: RoadmapState;
  dispatch: React.Dispatch<RoadmapAction>;
}

const RoadmapContext = createContext<RoadmapContextValue | null>(null);

interface RoadmapProviderProps {
  children: ReactNode;
}

export function RoadmapProvider({ children }: RoadmapProviderProps) {
  const [state, dispatch] = useReducer(roadmapReducer, {
    roadmap: createInitialRoadmap(),
    isLoading: true,
  });

  useEffect(() => {
    const saved = loadRoadmap();
    if (saved) {
      dispatch({ type: 'LOAD_ROADMAP', payload: saved });
    } else {
      dispatch({ type: 'LOAD_ROADMAP', payload: sampleRoadmap });
    }
  }, []);

  useEffect(() => {
    if (!state.isLoading) {
      saveRoadmap(state.roadmap);
    }
  }, [state.roadmap, state.isLoading]);

  return (
    <RoadmapContext.Provider value={{ state, dispatch }}>
      {children}
    </RoadmapContext.Provider>
  );
}

export function useRoadmap() {
  const context = useContext(RoadmapContext);
  if (!context) {
    throw new Error('useRoadmap must be used within a RoadmapProvider');
  }
  return context;
}

export function useRoadmapData() {
  const { state } = useRoadmap();
  return state.roadmap;
}

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  type ReactNode,
} from 'react';
import type {
  Roadmap,
  Theme,
  Initiative,
  Feature,
  RoadmapSettings,
} from '../types';
import { generateId, saveRoadmap, loadRoadmap, getNextQuarterStart, formatDateISO } from '../utils';
import { sampleRoadmap } from '../data';

interface RoadmapState {
  roadmap: Roadmap;
  isLoading: boolean;
}

type RoadmapAction =
  | { type: 'ADD_THEME'; payload: Omit<Theme, 'id' | 'order'> }
  | { type: 'UPDATE_THEME'; payload: Theme }
  | { type: 'DELETE_THEME'; payload: string }
  | { type: 'REORDER_THEMES'; payload: string[] }
  | { type: 'ADD_INITIATIVE'; payload: Omit<Initiative, 'id' | 'order'> }
  | { type: 'UPDATE_INITIATIVE'; payload: Initiative }
  | { type: 'DELETE_INITIATIVE'; payload: string }
  | { type: 'MOVE_INITIATIVE'; payload: { id: string; newThemeId: string } }
  | { type: 'REORDER_INITIATIVES'; payload: { themeId: string; initiativeIds: string[] } }
  | { type: 'ADD_FEATURE'; payload: Omit<Feature, 'id' | 'order'> }
  | { type: 'UPDATE_FEATURE'; payload: Feature }
  | { type: 'DELETE_FEATURE'; payload: string }
  | { type: 'MOVE_FEATURE'; payload: { id: string; newInitiativeId: string } }
  | { type: 'REORDER_FEATURES'; payload: { initiativeId: string; featureIds: string[] } }
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
    themes: [],
    initiatives: [],
    features: [],
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
    case 'ADD_THEME': {
      const newTheme: Theme = {
        ...action.payload,
        id: generateId(),
        order: state.roadmap.themes.length,
      };
      return updateRoadmap({
        themes: [...state.roadmap.themes, newTheme],
      });
    }

    case 'UPDATE_THEME': {
      return updateRoadmap({
        themes: state.roadmap.themes.map((t) =>
          t.id === action.payload.id ? action.payload : t
        ),
      });
    }

    case 'DELETE_THEME': {
      return updateRoadmap({
        themes: state.roadmap.themes.filter((t) => t.id !== action.payload),
      });
    }

    case 'REORDER_THEMES': {
      const reordered = action.payload.map((id, index) => {
        const theme = state.roadmap.themes.find((t) => t.id === id);
        return theme ? { ...theme, order: index } : null;
      }).filter((t): t is Theme => t !== null);
      return updateRoadmap({ themes: reordered });
    }

    case 'ADD_INITIATIVE': {
      const initiativesInTheme = state.roadmap.initiatives.filter(
        (i) => i.themeId === action.payload.themeId
      );
      const newInitiative: Initiative = {
        ...action.payload,
        id: generateId(),
        order: initiativesInTheme.length,
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
            ? { ...i, themeId: action.payload.newThemeId }
            : i
        ),
      });
    }

    case 'REORDER_INITIATIVES': {
      const { themeId, initiativeIds } = action.payload;
      const otherInitiatives = state.roadmap.initiatives.filter(
        (i) => i.themeId !== themeId
      );
      const reordered = initiativeIds.map((id, index) => {
        const initiative = state.roadmap.initiatives.find((i) => i.id === id);
        return initiative ? { ...initiative, order: index } : null;
      }).filter((i): i is Initiative => i !== null);
      return updateRoadmap({
        initiatives: [...otherInitiatives, ...reordered],
      });
    }

    case 'ADD_FEATURE': {
      const featuresInInitiative = state.roadmap.features.filter(
        (f) => f.initiativeId === action.payload.initiativeId
      );
      const newFeature: Feature = {
        ...action.payload,
        id: generateId(),
        order: featuresInInitiative.length,
      };
      return updateRoadmap({
        features: [...state.roadmap.features, newFeature],
      });
    }

    case 'UPDATE_FEATURE': {
      return updateRoadmap({
        features: state.roadmap.features.map((f) =>
          f.id === action.payload.id ? action.payload : f
        ),
      });
    }

    case 'DELETE_FEATURE': {
      return updateRoadmap({
        features: state.roadmap.features.filter((f) => f.id !== action.payload),
      });
    }

    case 'MOVE_FEATURE': {
      return updateRoadmap({
        features: state.roadmap.features.map((f) =>
          f.id === action.payload.id
            ? { ...f, initiativeId: action.payload.newInitiativeId }
            : f
        ),
      });
    }

    case 'REORDER_FEATURES': {
      const { initiativeId, featureIds } = action.payload;
      const otherFeatures = state.roadmap.features.filter(
        (f) => f.initiativeId !== initiativeId
      );
      const reordered = featureIds.map((id, index) => {
        const feature = state.roadmap.features.find((f) => f.id === id);
        return feature ? { ...feature, order: index } : null;
      }).filter((f): f is Feature => f !== null);
      return updateRoadmap({
        features: [...otherFeatures, ...reordered],
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

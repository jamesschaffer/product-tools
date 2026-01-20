import { useMemo } from 'react';
import { useRoadmap } from '../../context';
import { buildGanttRows } from '../../utils';
import { GanttHeader } from './GanttHeader';
import { GanttRow } from './GanttRow';
import type { Deliverable } from '../../types';

export function GanttView() {
  const { state, dispatch } = useRoadmap();
  const { roadmap } = state;

  const viewStart = useMemo(() => {
    return new Date(roadmap.settings.viewStartDate);
  }, [roadmap.settings.viewStartDate]);

  const viewMonths = 12;

  const rows = useMemo(() => {
    return buildGanttRows(roadmap);
  }, [roadmap]);

  const handleUpdateDeliverable = (deliverable: Deliverable) => {
    dispatch({ type: 'UPDATE_DELIVERABLE', payload: deliverable });
  };

  if (roadmap.goals.length === 0) {
    return (
      <div className="p-6">
        <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
          <p className="text-gray-500">No data to display</p>
          <p className="mt-2 text-sm text-gray-400">
            Add goals and deliverables in the Edit view
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-73px)] flex flex-col">
      <div className="p-6 border-b border-gray-200 bg-white">
        <h2 className="text-lg font-medium text-gray-900">{roadmap.title}</h2>
        <p className="text-sm text-gray-500">
          Timeline view • Drag deliverable edges to adjust dates
        </p>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="min-w-[1000px]">
          <GanttHeader viewStart={viewStart} viewMonths={viewMonths} />

          <div>
            {rows.map((row, index) => (
              <GanttRow
                key={`${row.goal.id}-${row.initiative.id}-${index}`}
                row={row}
                viewStart={viewStart}
                viewMonths={viewMonths}
                onUpdateDeliverable={handleUpdateDeliverable}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

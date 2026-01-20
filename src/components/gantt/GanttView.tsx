import { useMemo } from 'react';
import { useRoadmap } from '../../context';
import { buildGanttRows, getQuarterStart } from '../../utils';
import { GanttHeader } from './GanttHeader';
import { GanttGoalSection } from './GanttGoalSection';
import type { Deliverable } from '../../types';

export function GanttView() {
  const { state, dispatch } = useRoadmap();
  const { roadmap } = state;

  const { viewStart, viewMonths } = useMemo(() => {
    const now = new Date();
    const quarterStart = getQuarterStart(now);

    // Find the earliest and latest dates from deliverables
    let earliest: Date | null = null;
    let latest: Date | null = null;

    for (const deliverable of roadmap.deliverables) {
      if (deliverable.startDate) {
        const start = new Date(deliverable.startDate);
        if (!earliest || start < earliest) earliest = start;
      }
      if (deliverable.endDate) {
        const end = new Date(deliverable.endDate);
        if (!latest || end > latest) latest = end;
      }
    }

    // Default view start to current quarter
    let viewStart = quarterStart;

    // If there are deliverables earlier than current quarter, extend back
    if (earliest) {
      const earliestQuarter = getQuarterStart(earliest);
      if (earliestQuarter < viewStart) {
        viewStart = earliestQuarter;
      }
    }

    // Calculate months needed (minimum 12, extend to cover all deliverables + buffer)
    let viewMonths = 12;
    if (latest) {
      const monthsToLatest = Math.ceil(
        (latest.getTime() - viewStart.getTime()) / (1000 * 60 * 60 * 24 * 30)
      );
      // Round up to nearest quarter (3 months) and add buffer
      viewMonths = Math.max(12, Math.ceil((monthsToLatest + 3) / 3) * 3);
    }

    return { viewStart, viewMonths };
  }, [roadmap.deliverables]);

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

      <div className="flex-1 overflow-x-auto overflow-y-auto">
        <div style={{ minWidth: `${352 + viewMonths * 80}px` }}>
          <GanttHeader viewStart={viewStart} viewMonths={viewMonths} />

          <div>
            {(() => {
              // Group rows by goal
              const goalGroups: Record<string, typeof rows> = {};
              for (const row of rows) {
                if (!goalGroups[row.goal.id]) {
                  goalGroups[row.goal.id] = [];
                }
                goalGroups[row.goal.id].push(row);
              }

              return Object.values(goalGroups).map((goalRows) => (
                <GanttGoalSection
                  key={goalRows[0].goal.id}
                  goal={goalRows[0].goal}
                  rows={goalRows}
                  viewStart={viewStart}
                  viewMonths={viewMonths}
                  onUpdateDeliverable={handleUpdateDeliverable}
                />
              ));
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}

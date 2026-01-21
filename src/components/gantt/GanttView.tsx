import { useMemo, useState, useRef, useEffect } from 'react';
import { useRoadmap } from '../../context';
import { buildGanttRows, getQuarterStart, dateToPercent } from '../../utils';
import { GanttHeader } from './GanttHeader';
import { GanttGoalSection } from './GanttGoalSection';
import { ExportModal } from '../export';
import type { Deliverable } from '../../types';

export function GanttView() {
  const { state, updateDeliverable } = useRoadmap();
  const { roadmap } = state;
  const [showExport, setShowExport] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const { viewStart, viewMonths, currentQuarterPercent } = useMemo(() => {
    const now = new Date();
    const currentQuarter = getQuarterStart(now);

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
    let viewStart = currentQuarter;

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
      viewMonths = Math.max(12, Math.ceil((monthsToLatest + 3) / 3) * 3);
    }

    // Calculate where current quarter is as a percentage of the view
    const currentQuarterPercent = dateToPercent(currentQuarter, viewStart, viewMonths);

    return { viewStart, viewMonths, currentQuarterPercent };
  }, [roadmap.deliverables]);

  // Scroll to current quarter on mount
  useEffect(() => {
    if (scrollContainerRef.current && currentQuarterPercent > 0) {
      const container = scrollContainerRef.current;
      const totalWidth = 352 + viewMonths * 80;
      const scrollPosition = (currentQuarterPercent / 100) * totalWidth - 100;
      container.scrollLeft = Math.max(0, scrollPosition);
    }
  }, [currentQuarterPercent, viewMonths]);

  const rows = useMemo(() => {
    return buildGanttRows(roadmap);
  }, [roadmap]);

  const handleUpdateDeliverable = (deliverable: Deliverable) => {
    updateDeliverable(deliverable);
  };

  if (roadmap.goals.length === 0) {
    return (
      <div className="p-6">
        <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
          <p className="text-gray-500">No data to display</p>
          <p className="mt-2 text-sm text-gray-400">
            Add goals and deliverables in the Editor
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-73px)] flex flex-col">
      <div className="p-6 border-b border-gray-200 bg-white flex items-start justify-between">
        <div>
          <h2 className="text-lg font-medium text-gray-900">Timeline</h2>
          <p className="text-sm text-gray-500">
            Drag deliverable edges to adjust dates
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowExport(true)}
          className="rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          Export
        </button>
      </div>

      <div ref={scrollContainerRef} className="flex-1 overflow-x-auto overflow-y-auto">
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

      <ExportModal isOpen={showExport} onClose={() => setShowExport(false)} />
    </div>
  );
}

import { Tooltip } from '../ui';
import { GanttInitiativeRow } from './GanttInitiativeRow';
import type { GanttRowData } from '../../utils';
import type { Goal, Deliverable } from '../../types';

interface GanttGoalSectionProps {
  goal: Goal;
  rows: GanttRowData[];
  viewStart: Date;
  viewMonths: number;
  onUpdateDeliverable: (deliverable: Deliverable) => void;
}

export function GanttGoalSection({
  goal,
  rows,
  viewStart,
  viewMonths,
  onUpdateDeliverable,
}: GanttGoalSectionProps) {
  return (
    <div className="flex border-b border-gray-200">
      {/* A-col: Goal */}
      <div className="w-40 shrink-0 border-r border-gray-200 bg-gray-50 pl-6 pr-3 sticky left-0 z-10 flex items-center">
        <Tooltip
          content={
            <div>
              <div className="text-xs text-gray-500 mb-1">Ideal Outcome</div>
              <div className="text-xs text-teal-600 font-medium">
                → {goal.desiredOutcome}
              </div>
            </div>
          }
        >
          <div className="text-sm font-medium text-gray-900 cursor-pointer hover:text-teal-600 transition-colors">
            {goal.name}
          </div>
        </Tooltip>
      </div>

      {/* B-col: Initiatives container */}
      <div className="flex-1 min-w-0">
        {rows.map((row, index) => (
          <GanttInitiativeRow
            key={row.initiative.id}
            row={row}
            viewStart={viewStart}
            viewMonths={viewMonths}
            onUpdateDeliverable={onUpdateDeliverable}
            isLast={index === rows.length - 1}
          />
        ))}
      </div>
    </div>
  );
}

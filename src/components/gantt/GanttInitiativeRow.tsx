import { useMemo } from 'react';
import { DeliverableBar } from './DeliverableBar';
import { UnscheduledRow } from './UnscheduledRow';
import { Tooltip } from '../ui';
import { generateMonthLabels } from '../../utils';
import type { GanttRowData } from '../../utils';
import type { Deliverable } from '../../types';

interface GanttInitiativeRowProps {
  row: GanttRowData;
  viewStart: Date;
  viewMonths: number;
  onUpdateDeliverable: (deliverable: Deliverable) => void;
  isLast: boolean;
}

export function GanttInitiativeRow({
  row,
  viewStart,
  viewMonths,
  onUpdateDeliverable,
  isLast,
}: GanttInitiativeRowProps) {
  const {
    initiative,
    scheduledDeliverables,
    unscheduledDeliverables,
    initiativeCountInGoal,
    rowHeight,
  } = row;

  const timelineHeight = rowHeight;

  const handleUpdateDates = (deliverableId: string) => (startDate: string, endDate: string) => {
    const deliverable = scheduledDeliverables.find((d) => d.id === deliverableId);
    if (deliverable) {
      onUpdateDeliverable({
        ...deliverable,
        startDate,
        endDate,
      });
    }
  };

  const isEmptyGoal = initiativeCountInGoal === 0;
  const rowBorderClass = isLast ? '' : 'border-b border-gray-200';

  const monthLabels = useMemo(
    () => generateMonthLabels(viewStart, viewMonths),
    [viewStart, viewMonths]
  );

  return (
    <div>
      <div className="flex">
        {/* Initiative column */}
        <div className={`w-48 shrink-0 border-r border-gray-200 bg-white px-3 sticky left-40 z-10 flex items-center ${rowBorderClass}`}>
          {!isEmptyGoal && (
            <Tooltip
              content={
                <div>
                  <div className="text-xs text-gray-500 mb-1">Ideal Outcome</div>
                  <div className="text-xs text-teal-600 font-medium">
                    → {initiative.idealOutcome}
                  </div>
                </div>
              }
            >
              <div className="text-xs font-medium text-gray-600 cursor-pointer hover:text-teal-600 transition-colors">
                {initiative.name}
              </div>
            </Tooltip>
          )}
          {isEmptyGoal && (
            <div className="text-sm text-gray-400 italic">No initiatives</div>
          )}
        </div>

        {/* Timeline */}
        <div
          className={`flex-1 relative bg-white overflow-hidden ${rowBorderClass}`}
          style={{ height: `${timelineHeight}px` }}
        >
          {/* Grid lines */}
          <div className="absolute inset-0 flex">
            {monthLabels.map((month, i) => {
              const isQuarterEnd = (i + 1) % 3 === 0;
              return (
                <div
                  key={`${month.month}-${month.year}-${i}`}
                  className={`border-r ${isQuarterEnd ? 'border-gray-200' : 'border-gray-100'}`}
                  style={{ width: `${month.widthPercent}%` }}
                />
              );
            })}
          </div>

          {/* Deliverable bars */}
          {scheduledDeliverables.map((deliverable) => (
            <DeliverableBar
              key={deliverable.id}
              deliverable={deliverable}
              viewStart={viewStart}
              viewMonths={viewMonths}
              stackIndex={deliverable.stackIndex}
              onUpdateDates={handleUpdateDates(deliverable.id)}
            />
          ))}
        </div>
      </div>

      {/* Unscheduled deliverables */}
      {unscheduledDeliverables.length > 0 && (
        <div className="flex">
          <div className="w-48 shrink-0 border-r border-gray-200 bg-white sticky left-40 z-10" />
          <div className="flex-1">
            <UnscheduledRow deliverables={unscheduledDeliverables} />
          </div>
        </div>
      )}
    </div>
  );
}

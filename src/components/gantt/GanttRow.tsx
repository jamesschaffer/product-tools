import { DeliverableBar } from './DeliverableBar';
import { UnscheduledRow } from './UnscheduledRow';
import type { GanttRowData } from '../../utils';
import type { Deliverable } from '../../types';

interface GanttRowProps {
  row: GanttRowData;
  viewStart: Date;
  viewMonths: number;
  onUpdateDeliverable: (deliverable: Deliverable) => void;
}

export function GanttRow({
  row,
  viewStart,
  viewMonths,
  onUpdateDeliverable,
}: GanttRowProps) {
  const {
    goal,
    initiative,
    scheduledDeliverables,
    unscheduledDeliverables,
    maxStackIndex,
    isFirstInitiativeInGoal,
    initiativeCountInGoal,
  } = row;

  const barHeight = 24;
  const barGap = 4;
  const minTimelineHeight = 40;
  const timelineHeight = Math.max(
    minTimelineHeight,
    (maxStackIndex + 1) * (barHeight + barGap) + 8
  );

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

  return (
    <div className="border-b border-gray-200">
      <div className="flex">
        {isFirstInitiativeInGoal && (
          <div
            className="w-40 shrink-0 border-r border-gray-200 bg-gray-50 px-3 py-2"
            style={{
              gridRow: `span ${initiativeCountInGoal || 1}`,
            }}
          >
            <div className="text-sm font-medium text-gray-900">{goal.name}</div>
            {goal.description && (
              <div className="text-[10px] text-gray-500 mt-0.5 line-clamp-2">
                {goal.description}
              </div>
            )}
          </div>
        )}
        {!isFirstInitiativeInGoal && (
          <div className="w-40 shrink-0 border-r border-gray-200" />
        )}

        <div className="w-48 shrink-0 border-r border-gray-200 px-3 py-2">
          {!isEmptyGoal && (
            <>
              <div className="text-sm font-medium text-gray-800">
                {initiative.name}
              </div>
              {initiative.idealOutcome && (
                <div className="text-[10px] text-teal-600 mt-0.5 line-clamp-2">
                  → {initiative.idealOutcome}
                </div>
              )}
            </>
          )}
          {isEmptyGoal && (
            <div className="text-sm text-gray-400 italic">No initiatives</div>
          )}
        </div>

        <div
          className="flex-1 min-w-0 relative bg-white overflow-hidden"
          style={{ height: `${timelineHeight}px` }}
        >
          <div className="absolute inset-0 flex">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="flex-1 border-r border-gray-100"
                style={{ width: `${100 / 12}%` }}
              />
            ))}
          </div>

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

      {unscheduledDeliverables.length > 0 && (
        <div className="flex">
          <div className="w-40 shrink-0 border-r border-gray-200" />
          <div className="w-48 shrink-0 border-r border-gray-200" />
          <div className="flex-1">
            <UnscheduledRow deliverables={unscheduledDeliverables} />
          </div>
        </div>
      )}
    </div>
  );
}

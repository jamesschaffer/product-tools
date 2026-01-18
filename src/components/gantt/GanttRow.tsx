import { FeatureBar } from './FeatureBar';
import { UnscheduledRow } from './UnscheduledRow';
import type { GanttRowData } from '../../utils';
import type { Feature } from '../../types';

interface GanttRowProps {
  row: GanttRowData;
  viewStart: Date;
  viewMonths: number;
  onUpdateFeature: (feature: Feature) => void;
}

export function GanttRow({
  row,
  viewStart,
  viewMonths,
  onUpdateFeature,
}: GanttRowProps) {
  const {
    theme,
    initiative,
    scheduledFeatures,
    unscheduledFeatures,
    maxStackIndex,
    isFirstInitiativeInTheme,
    initiativeCountInTheme,
  } = row;

  const barHeight = 24;
  const barGap = 4;
  const minTimelineHeight = 40;
  const timelineHeight = Math.max(
    minTimelineHeight,
    (maxStackIndex + 1) * (barHeight + barGap) + 8
  );

  const handleUpdateDates = (featureId: string) => (startDate: string, endDate: string) => {
    const feature = scheduledFeatures.find((f) => f.id === featureId);
    if (feature) {
      onUpdateFeature({
        ...feature,
        startDate,
        endDate,
      });
    }
  };

  const isEmptyTheme = initiativeCountInTheme === 0;

  return (
    <div className="border-b border-gray-200">
      <div className="flex">
        {isFirstInitiativeInTheme && (
          <div
            className="w-40 shrink-0 border-r border-gray-200 bg-gray-50 px-3 py-2"
            style={{
              gridRow: `span ${initiativeCountInTheme || 1}`,
            }}
          >
            <div className="text-sm font-medium text-gray-900">{theme.name}</div>
            {theme.description && (
              <div className="text-[10px] text-gray-500 mt-0.5 line-clamp-2">
                {theme.description}
              </div>
            )}
          </div>
        )}
        {!isFirstInitiativeInTheme && (
          <div className="w-40 shrink-0 border-r border-gray-200" />
        )}

        <div className="w-48 shrink-0 border-r border-gray-200 px-3 py-2">
          {!isEmptyTheme && (
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
          {isEmptyTheme && (
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

          {scheduledFeatures.map((feature) => (
            <FeatureBar
              key={feature.id}
              feature={feature}
              viewStart={viewStart}
              viewMonths={viewMonths}
              stackIndex={feature.stackIndex}
              onUpdateDates={handleUpdateDates(feature.id)}
            />
          ))}
        </div>
      </div>

      {unscheduledFeatures.length > 0 && (
        <div className="flex">
          <div className="w-40 shrink-0 border-r border-gray-200" />
          <div className="w-48 shrink-0 border-r border-gray-200" />
          <div className="flex-1">
            <UnscheduledRow features={unscheduledFeatures} />
          </div>
        </div>
      )}
    </div>
  );
}

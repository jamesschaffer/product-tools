import { generateQuarterLabels, generateMonthLabels } from '../../utils';

interface GanttHeaderProps {
  viewStart: Date;
  viewMonths?: number;
}

export function GanttHeader({ viewStart, viewMonths = 12 }: GanttHeaderProps) {
  const quarters = generateQuarterLabels(viewStart, viewMonths);
  const months = generateMonthLabels(viewStart, viewMonths);

  return (
    <div className="sticky top-0 z-20 bg-white border-b border-gray-200">
      <div className="flex">
        <div className="w-40 shrink-0 border-r border-gray-200 bg-gray-50 pl-6 pr-3 py-2 sticky left-0 z-10 flex items-center">
          <span className="text-xs font-medium text-gray-500">Goal</span>
        </div>
        <div className="w-48 shrink-0 border-r border-gray-200 bg-gray-50 px-3 py-2 sticky left-40 z-10 flex items-center">
          <span className="text-xs font-medium text-gray-500">Initiative</span>
        </div>
        <div className="flex-1">
          <div className="flex">
            {quarters.map((q, i) => (
              <div
                key={`${q.quarter}-${q.year}-${i}`}
                className="border-r border-gray-200 bg-gray-50 px-2 py-1 text-center"
                style={{ width: `${q.widthPercent}%` }}
              >
                <span className="text-xs font-semibold text-gray-700">
                  {q.quarter} {q.year}
                </span>
              </div>
            ))}
          </div>
          <div className="flex">
            {months.map((m, i) => {
              const isQuarterEnd = (i + 1) % 3 === 0;
              return (
                <div
                  key={`${m.month}-${m.year}-${i}`}
                  className={`bg-gray-50 px-1 py-1 text-center ${isQuarterEnd ? 'border-r border-gray-200' : ''}`}
                  style={{ width: `${m.widthPercent}%` }}
                >
                  <span className="text-[10px] text-gray-500">{m.month}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

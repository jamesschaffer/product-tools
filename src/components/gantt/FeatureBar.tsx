import { useState, useRef, useCallback, useEffect } from 'react';
import { dateToPercent, percentToDate, formatDateISO } from '../../utils';
import type { Feature, FeatureStatus } from '../../types';

interface FeatureBarProps {
  feature: Feature;
  viewStart: Date;
  viewMonths: number;
  stackIndex: number;
  onUpdateDates: (startDate: string, endDate: string) => void;
}

const statusColors: Record<FeatureStatus, string> = {
  shipped: 'bg-slate-700 border-slate-800',
  'in-progress': 'bg-teal-500 border-teal-600',
  planned: 'bg-slate-200 border-slate-300',
};

const statusTextColors: Record<FeatureStatus, string> = {
  shipped: 'text-white',
  'in-progress': 'text-white',
  planned: 'text-slate-600',
};

export function FeatureBar({
  feature,
  viewStart,
  viewMonths,
  stackIndex,
  onUpdateDates,
}: FeatureBarProps) {
  const barRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState<'left' | 'right' | null>(null);
  const [tempDates, setTempDates] = useState<{ start: string; end: string } | null>(null);

  const startDate = tempDates?.start || feature.startDate!;
  const endDate = tempDates?.end || feature.endDate!;

  const rawLeft = dateToPercent(new Date(startDate), viewStart, viewMonths);
  const rawRight = dateToPercent(new Date(endDate), viewStart, viewMonths);

  // Clamp to visible range (0-100%)
  const left = Math.max(0, rawLeft);
  const right = Math.min(100, rawRight);
  const width = right - left;

  // Don't render if entirely outside view window
  if (rawRight <= 0 || rawLeft >= 100 || width <= 0) {
    return null;
  }

  const handleMouseDown = useCallback(
    (side: 'left' | 'right') => (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(side);
      setTempDates({ start: feature.startDate!, end: feature.endDate! });
    },
    [feature.startDate, feature.endDate]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !barRef.current) return;

      const container = barRef.current.parentElement;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const percent = ((e.clientX - rect.left) / rect.width) * 100;
      const clampedPercent = Math.max(0, Math.min(100, percent));
      const newDate = percentToDate(clampedPercent, viewStart, viewMonths);
      const newDateStr = formatDateISO(newDate);

      setTempDates((prev) => {
        if (!prev) return null;

        if (isDragging === 'left') {
          if (new Date(newDateStr) >= new Date(prev.end)) return prev;
          return { ...prev, start: newDateStr };
        } else {
          if (new Date(newDateStr) <= new Date(prev.start)) return prev;
          return { ...prev, end: newDateStr };
        }
      });
    },
    [isDragging, viewStart, viewMonths]
  );

  const handleMouseUp = useCallback(() => {
    if (isDragging && tempDates) {
      onUpdateDates(tempDates.start, tempDates.end);
    }
    setIsDragging(null);
    setTempDates(null);
  }, [isDragging, tempDates, onUpdateDates]);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const barHeight = 24;
  const barGap = 4;
  const topOffset = stackIndex * (barHeight + barGap) + 4;

  return (
    <div
      ref={barRef}
      className={`absolute rounded border ${statusColors[feature.status]} ${isDragging ? 'opacity-80' : ''} group cursor-default`}
      style={{
        left: `${left}%`,
        width: `${Math.max(width, 2)}%`,
        top: `${topOffset}px`,
        height: `${barHeight}px`,
      }}
      title={`${feature.name}\n${startDate} - ${endDate}`}
    >
      <div
        className="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-black/10 rounded-l"
        onMouseDown={handleMouseDown('left')}
      />

      <div
        className={`px-2 truncate text-[10px] font-medium leading-6 ${statusTextColors[feature.status]}`}
      >
        {feature.name}
      </div>

      <div
        className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-black/10 rounded-r"
        onMouseDown={handleMouseDown('right')}
      />
    </div>
  );
}

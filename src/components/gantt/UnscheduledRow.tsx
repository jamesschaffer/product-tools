import type { Deliverable, DeliverableStatus } from '../../types';

interface UnscheduledRowProps {
  deliverables: Deliverable[];
}

const statusColors: Record<DeliverableStatus, string> = {
  shipped: 'bg-slate-700 text-white',
  'in-progress': 'bg-teal-500 text-white',
  planned: 'bg-slate-200 text-slate-600 border border-slate-300',
};

export function UnscheduledRow({ deliverables }: UnscheduledRowProps) {
  if (deliverables.length === 0) return null;

  return (
    <div className="flex items-center gap-2 py-2 px-2 bg-amber-50 border-t border-amber-200">
      <span className="text-[10px] text-amber-700 font-medium shrink-0">
        Unscheduled:
      </span>
      <div className="flex flex-wrap gap-1">
        {deliverables.map((deliverable) => (
          <span
            key={deliverable.id}
            className={`text-[10px] px-2 py-0.5 rounded ${statusColors[deliverable.status]}`}
            title={`${deliverable.name} - needs dates`}
          >
            {deliverable.name}
          </span>
        ))}
      </div>
    </div>
  );
}

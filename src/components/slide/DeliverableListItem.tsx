import type { Deliverable, DeliverableStatus } from '../../types';

interface DeliverableListItemProps {
  deliverable: Deliverable;
}

const statusStyles: Record<DeliverableStatus, string> = {
  shipped: 'bg-slate-800 text-white',
  'in-progress': 'bg-teal-600 text-white',
  planned: 'bg-white text-slate-700 border border-slate-300',
};

const statusLabels: Record<DeliverableStatus, string> = {
  shipped: 'Shipped',
  'in-progress': 'In Progress',
  planned: 'Planned',
};

export function DeliverableListItem({ deliverable }: DeliverableListItemProps) {
  return (
    <div className="flex items-center justify-between gap-2 py-1">
      <span className="text-xs text-slate-700 leading-tight">{deliverable.name}</span>
      <span
        className={`shrink-0 text-[9px] font-semibold px-2 py-0.5 rounded uppercase tracking-wide ${statusStyles[deliverable.status]}`}
      >
        {statusLabels[deliverable.status]}
      </span>
    </div>
  );
}

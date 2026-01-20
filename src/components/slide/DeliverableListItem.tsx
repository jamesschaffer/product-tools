import type { Deliverable, DeliverableStatus } from '../../types';

interface DeliverableListItemProps {
  deliverable: Deliverable;
}

const statusStyles: Record<DeliverableStatus, string> = {
  shipped: 'bg-green-600',
  'in-progress': 'bg-blue-600',
  planned: 'bg-white border border-slate-300',
};

export function DeliverableListItem({ deliverable }: DeliverableListItemProps) {
  return (
    <div className="flex items-center gap-2 py-1">
      <span className={`shrink-0 w-2.5 h-2.5 rounded-full ${statusStyles[deliverable.status]}`} />
      <span className="text-xs text-slate-700 leading-tight">{deliverable.name}</span>
    </div>
  );
}

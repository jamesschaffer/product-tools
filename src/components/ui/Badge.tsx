import type { DeliverableStatus } from '../../types';

interface BadgeProps {
  status: DeliverableStatus;
}

const statusStyles: Record<DeliverableStatus, string> = {
  shipped: 'bg-teal-500 text-white',
  'in-progress': 'bg-slate-700 text-white',
  planned: 'bg-slate-200 text-slate-600',
};

const statusLabels: Record<DeliverableStatus, string> = {
  shipped: 'Shipped',
  'in-progress': 'In Progress',
  planned: 'Planned',
};

export function Badge({ status }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${statusStyles[status]}`}
    >
      {statusLabels[status]}
    </span>
  );
}

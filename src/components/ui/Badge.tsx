import type { DeliverableStatus } from '../../types';

interface BadgeProps {
  status: DeliverableStatus;
}

const statusStyles: Record<DeliverableStatus, string> = {
  shipped: 'bg-gray-900 text-white',
  'in-progress': 'bg-blue-600 text-white',
  planned: 'bg-white text-gray-700 border border-gray-300',
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

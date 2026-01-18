import type { Feature, FeatureStatus } from '../../types';

interface FeatureListItemProps {
  feature: Feature;
}

const statusStyles: Record<FeatureStatus, string> = {
  shipped: 'bg-slate-800 text-white',
  'in-progress': 'bg-teal-600 text-white',
  planned: 'bg-white text-slate-700 border border-slate-300',
};

const statusLabels: Record<FeatureStatus, string> = {
  shipped: 'Shipped',
  'in-progress': 'In Progress',
  planned: 'Planned',
};

export function FeatureListItem({ feature }: FeatureListItemProps) {
  return (
    <div className="flex items-center justify-between gap-2 py-1">
      <span className="text-xs text-slate-700 leading-tight">{feature.name}</span>
      <span
        className={`shrink-0 text-[9px] font-semibold px-2 py-0.5 rounded uppercase tracking-wide ${statusStyles[feature.status]}`}
      >
        {statusLabels[feature.status]}
      </span>
    </div>
  );
}

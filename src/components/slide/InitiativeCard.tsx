import type { InitiativeWithChildren } from '../../types';
import { DeliverableListItem } from './DeliverableListItem';

interface InitiativeCardProps {
  initiative: InitiativeWithChildren;
}

export function InitiativeCard({ initiative }: InitiativeCardProps) {
  return (
    <div className="bg-white rounded-md p-3 shadow-sm">
      <h4 className="text-xs font-semibold text-slate-800 mb-2 pb-2 border-b border-slate-100">
        {initiative.name}
      </h4>
      <div className="space-y-1 mb-3">
        {initiative.deliverables.map((deliverable) => (
          <DeliverableListItem key={deliverable.id} deliverable={deliverable} />
        ))}
        {initiative.deliverables.length === 0 && (
          <p className="text-xs text-slate-400 italic">No deliverables yet</p>
        )}
      </div>
      <div className="text-[10px] text-teal-600 font-medium pt-2 border-t border-dashed border-slate-200 leading-snug">
        → {initiative.idealOutcome}
      </div>
    </div>
  );
}

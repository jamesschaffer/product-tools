import type { GoalWithChildren } from '../../types';
import { InitiativeCard } from './InitiativeCard';

interface GoalColumnProps {
  goal: GoalWithChildren;
}

export function GoalColumn({ goal }: GoalColumnProps) {
  return (
    <div className="flex flex-col min-w-[280px] max-w-[320px]">
      <div className="bg-slate-800 text-white px-3 py-4 rounded-t-lg h-[96px]">
        <h3 className="text-base font-semibold line-clamp-2">
          <span className="inline-flex items-center justify-center h-5 w-5 rounded bg-white/20 text-xs font-semibold mr-2 -translate-y-px">{goal.priority}</span>
          {goal.name}
        </h3>
        {goal.description && (
          <p className="text-sm opacity-85 leading-snug line-clamp-2">
            {goal.description}
          </p>
        )}
      </div>
      <div className="flex-1 bg-slate-50 border-x border-slate-200 p-3 space-y-3">
        {goal.initiatives.map((initiative) => (
          <InitiativeCard key={initiative.id} initiative={initiative} />
        ))}
        {goal.initiatives.length === 0 && (
          <p className="text-xs text-slate-400 italic text-center py-4">
            No initiatives yet
          </p>
        )}
      </div>
      <div className="bg-slate-100 border border-t-0 border-slate-200 rounded-b-lg px-3 py-2">
        <p className="text-xs text-slate-600 leading-snug">
          <span className="font-medium">Desired Outcome:</span> {goal.desiredOutcome}
        </p>
      </div>
    </div>
  );
}

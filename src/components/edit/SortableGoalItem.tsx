import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GoalItem } from './GoalItem';
import type { Goal, Initiative, Deliverable, DeliverableStatus } from '../../types';

interface SortableGoalItemProps {
  goal: Goal;
  initiatives: Initiative[];
  deliverables: Deliverable[];
  onUpdate: (goal: Goal) => void;
  onDelete: (id: string) => void;
  onAddInitiative: (data: { name: string; idealOutcome: string }) => void;
  onUpdateInitiative: (initiative: Initiative) => void;
  onDeleteInitiative: (id: string) => void;
  onAddDeliverable: (initiativeId: string, data: {
    name: string;
    description?: string;
    status: DeliverableStatus;
    startDate?: string;
    endDate?: string;
  }) => void;
  onUpdateDeliverable: (deliverable: Deliverable) => void;
  onDeleteDeliverable: (id: string) => void;
}

export function SortableGoalItem(props: SortableGoalItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: props.goal.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <GoalItem
        {...props}
        dragHandleProps={{ ...attributes, ...listeners }}
        isDragging={isDragging}
      />
    </div>
  );
}

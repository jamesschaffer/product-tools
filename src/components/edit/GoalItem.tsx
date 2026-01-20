import { useState } from 'react';
import { Button, Modal, ConfirmDialog } from '../ui';
import { GoalForm } from './GoalForm';
import { InitiativeForm } from './InitiativeForm';
import { InitiativeItem } from './InitiativeItem';
import type { Goal, Initiative, Deliverable, DeliverableStatus } from '../../types';

interface GoalItemProps {
  goal: Goal;
  initiatives: Initiative[];
  deliverables: Deliverable[];
  dragHandleProps?: Record<string, unknown>;
  isDragging?: boolean;
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

export function GoalItem({
  goal,
  initiatives,
  deliverables,
  dragHandleProps,
  isDragging,
  onUpdate,
  onDelete,
  onAddInitiative,
  onUpdateInitiative,
  onDeleteInitiative,
  onAddDeliverable,
  onUpdateDeliverable,
  onDeleteDeliverable,
}: GoalItemProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingInitiative, setIsAddingInitiative] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const hasInitiatives = initiatives.length > 0;

  const handleUpdate = (data: { name: string; description?: string; desiredOutcome: string }) => {
    onUpdate({
      ...goal,
      ...data,
    });
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (hasInitiatives) return;
    onDelete(goal.id);
  };

  const getInitiativeDeliverables = (initiativeId: string) => {
    return deliverables.filter((d) => d.initiativeId === initiativeId).sort((a, b) => a.order - b.order);
  };

  return (
    <div className={`rounded-lg border border-gray-200 bg-white overflow-hidden ${isDragging ? 'shadow-lg' : ''}`}>
      <div className="group flex items-start justify-between p-4 bg-gray-50 border-b border-gray-200">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          {dragHandleProps && (
            <div className="flex flex-col items-center gap-0.5">
              <button
                {...dragHandleProps}
                className="rounded p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-600 cursor-grab active:cursor-grabbing touch-none"
                aria-label="Drag to reorder"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 8h16M4 16h16"
                  />
                </svg>
              </button>
              <span className="flex h-5 w-5 items-center justify-center rounded bg-gray-200 text-xs font-semibold text-gray-600">
                {goal.priority}
              </span>
            </div>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-1 rounded p-0.5 text-gray-400 hover:bg-gray-200 hover:text-gray-600"
            aria-label={isExpanded ? 'Collapse' : 'Expand'}
          >
            <svg
              className={`h-5 w-5 transition-transform duration-200 ease-in-out ${isExpanded ? 'rotate-90' : 'rotate-0'}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-semibold text-gray-900">{goal.name}</h3>
            {goal.description && (
              <p className="text-sm text-gray-600 mt-0.5">{goal.description}</p>
            )}
            <p className="text-sm text-gray-500 mt-1">{goal.desiredOutcome}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
          <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)} title="Edit">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDeleteConfirm(true)}
            disabled={hasInitiatives}
            title={hasInitiatives ? 'Remove all initiatives first' : 'Delete'}
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </Button>
        </div>
      </div>

      <div
        className={`grid transition-[grid-template-rows] duration-200 ease-in-out ${
          isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        }`}
      >
        <div className="overflow-hidden">
          <div className="p-4 space-y-2">
          {initiatives.length === 0 ? (
            <p className="text-sm text-gray-400 italic">No initiatives yet</p>
          ) : (
            <div>
              {initiatives.map((initiative) => (
                <InitiativeItem
                  key={initiative.id}
                  initiative={initiative}
                  deliverables={getInitiativeDeliverables(initiative.id)}
                  onUpdate={onUpdateInitiative}
                  onDelete={onDeleteInitiative}
                  onAddDeliverable={(data) => onAddDeliverable(initiative.id, data)}
                  onUpdateDeliverable={onUpdateDeliverable}
                  onDeleteDeliverable={onDeleteDeliverable}
                />
              ))}
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsAddingInitiative(true)}
            className="mt-3 text-gray-500"
          >
            + Add Initiative
          </Button>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        title="Edit Goal"
      >
        <GoalForm
          goal={goal}
          onSubmit={handleUpdate}
          onCancel={() => setIsEditing(false)}
        />
      </Modal>

      <Modal
        isOpen={isAddingInitiative}
        onClose={() => setIsAddingInitiative(false)}
        title="Add Initiative"
      >
        <InitiativeForm
          onSubmit={(data) => {
            onAddInitiative(data);
            setIsAddingInitiative(false);
          }}
          onCancel={() => setIsAddingInitiative(false)}
        />
      </Modal>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Goal"
        message={
          hasInitiatives
            ? `Cannot delete "${goal.name}" because it has ${initiatives.length} initiative(s). Remove all initiatives first.`
            : `Are you sure you want to delete "${goal.name}"? This action cannot be undone.`
        }
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
}

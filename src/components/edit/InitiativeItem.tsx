import { useState } from 'react';
import { Button, Modal, ConfirmDialog } from '../ui';
import { InitiativeForm } from './InitiativeForm';
import { DeliverableForm } from './DeliverableForm';
import { DeliverableItem } from './DeliverableItem';
import type { Initiative, Deliverable, DeliverableStatus } from '../../types';

interface InitiativeItemProps {
  initiative: Initiative;
  deliverables: Deliverable[];
  onUpdate: (initiative: Initiative) => void;
  onDelete: (id: string) => void;
  onAddDeliverable: (data: {
    name: string;
    description?: string;
    status: DeliverableStatus;
    startDate?: string;
    endDate?: string;
  }) => void;
  onUpdateDeliverable: (deliverable: Deliverable) => void;
  onDeleteDeliverable: (id: string) => void;
}

export function InitiativeItem({
  initiative,
  deliverables,
  onUpdate,
  onDelete,
  onAddDeliverable,
  onUpdateDeliverable,
  onDeleteDeliverable,
}: InitiativeItemProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingDeliverable, setIsAddingDeliverable] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const hasDeliverables = deliverables.length > 0;

  const handleUpdate = (data: { name: string; idealOutcome: string }) => {
    onUpdate({
      ...initiative,
      ...data,
    });
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (hasDeliverables) return;
    onDelete(initiative.id);
  };

  return (
    <div className="ml-4 border-l-2 border-gray-200 pl-4">
      <div className="group flex items-start justify-between py-2">
        <div className="flex items-start gap-2 min-w-0 flex-1">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-1 rounded p-0.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            aria-label={isExpanded ? 'Collapse' : 'Expand'}
          >
            <svg
              className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-medium text-gray-900">{initiative.name}</h4>
            <p className="text-xs text-gray-500 mt-0.5">→ {initiative.idealOutcome}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
          <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDeleteConfirm(true)}
            disabled={hasDeliverables}
            title={hasDeliverables ? 'Remove all deliverables first' : undefined}
          >
            Delete
          </Button>
        </div>
      </div>

      {isExpanded && (
        <div className="ml-6 mt-1 space-y-1">
          {deliverables.map((deliverable) => (
            <DeliverableItem
              key={deliverable.id}
              deliverable={deliverable}
              onUpdate={onUpdateDeliverable}
              onDelete={onDeleteDeliverable}
            />
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsAddingDeliverable(true)}
            className="mt-2 text-gray-500"
          >
            + Add Deliverable
          </Button>
        </div>
      )}

      <Modal
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        title="Edit Initiative"
      >
        <InitiativeForm
          initiative={initiative}
          onSubmit={handleUpdate}
          onCancel={() => setIsEditing(false)}
        />
      </Modal>

      <Modal
        isOpen={isAddingDeliverable}
        onClose={() => setIsAddingDeliverable(false)}
        title="Add Deliverable"
      >
        <DeliverableForm
          onSubmit={(data) => {
            onAddDeliverable(data);
            setIsAddingDeliverable(false);
          }}
          onCancel={() => setIsAddingDeliverable(false)}
        />
      </Modal>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Initiative"
        message={
          hasDeliverables
            ? `Cannot delete "${initiative.name}" because it has ${deliverables.length} deliverable(s). Remove all deliverables first.`
            : `Are you sure you want to delete "${initiative.name}"? This action cannot be undone.`
        }
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
}

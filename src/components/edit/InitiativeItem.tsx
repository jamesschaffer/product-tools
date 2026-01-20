import { useState } from 'react';
import { Button, Modal, ConfirmDialog } from '../ui';
import { InitiativeForm } from './InitiativeForm';
import { DeliverablesTable } from './DeliverablesTable';
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
    <div className="ml-4 border-l-2 border-gray-200 pl-4 mb-4 last:mb-0">
      <div className="group flex items-start justify-between pb-1 mb-1">
        <div className="flex items-start gap-2 min-w-0 flex-1">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-1 rounded p-0.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            aria-label={isExpanded ? 'Collapse' : 'Expand'}
          >
            <svg
              className={`h-4 w-4 transition-transform duration-200 ease-in-out ${isExpanded ? 'rotate-90' : 'rotate-0'}`}
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
          <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)} title="Edit">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDeleteConfirm(true)}
            disabled={hasDeliverables}
            title={hasDeliverables ? 'Remove all deliverables first' : 'Delete'}
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
          <div className="ml-6 mt-1">
            <DeliverablesTable
              deliverables={deliverables}
              onUpdate={onUpdateDeliverable}
              onDelete={onDeleteDeliverable}
              onAdd={onAddDeliverable}
            />
          </div>
        </div>
      </div>

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

import { useState } from 'react';
import { Button, Modal, ConfirmDialog } from '../ui';
import { InitiativeForm } from './InitiativeForm';
import { FeatureForm } from './FeatureForm';
import { FeatureItem } from './FeatureItem';
import type { Initiative, Feature, FeatureStatus } from '../../types';

interface InitiativeItemProps {
  initiative: Initiative;
  features: Feature[];
  onUpdate: (initiative: Initiative) => void;
  onDelete: (id: string) => void;
  onAddFeature: (data: {
    name: string;
    description?: string;
    status: FeatureStatus;
    startDate?: string;
    endDate?: string;
  }) => void;
  onUpdateFeature: (feature: Feature) => void;
  onDeleteFeature: (id: string) => void;
}

export function InitiativeItem({
  initiative,
  features,
  onUpdate,
  onDelete,
  onAddFeature,
  onUpdateFeature,
  onDeleteFeature,
}: InitiativeItemProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingFeature, setIsAddingFeature] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const hasFeatures = features.length > 0;

  const handleUpdate = (data: { name: string; idealOutcome: string }) => {
    onUpdate({
      ...initiative,
      ...data,
    });
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (hasFeatures) return;
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
            disabled={hasFeatures}
            title={hasFeatures ? 'Remove all features first' : undefined}
          >
            Delete
          </Button>
        </div>
      </div>

      {isExpanded && (
        <div className="ml-6 mt-1 space-y-1">
          {features.map((feature) => (
            <FeatureItem
              key={feature.id}
              feature={feature}
              onUpdate={onUpdateFeature}
              onDelete={onDeleteFeature}
            />
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsAddingFeature(true)}
            className="mt-2 text-gray-500"
          >
            + Add Feature
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
        isOpen={isAddingFeature}
        onClose={() => setIsAddingFeature(false)}
        title="Add Feature"
      >
        <FeatureForm
          onSubmit={(data) => {
            onAddFeature(data);
            setIsAddingFeature(false);
          }}
          onCancel={() => setIsAddingFeature(false)}
        />
      </Modal>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Initiative"
        message={
          hasFeatures
            ? `Cannot delete "${initiative.name}" because it has ${features.length} feature(s). Remove all features first.`
            : `Are you sure you want to delete "${initiative.name}"? This action cannot be undone.`
        }
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
}

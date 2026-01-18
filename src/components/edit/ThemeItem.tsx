import { useState } from 'react';
import { Button, Modal, ConfirmDialog } from '../ui';
import { ThemeForm } from './ThemeForm';
import { InitiativeForm } from './InitiativeForm';
import { InitiativeItem } from './InitiativeItem';
import type { Theme, Initiative, Feature, FeatureStatus } from '../../types';

interface ThemeItemProps {
  theme: Theme;
  initiatives: Initiative[];
  features: Feature[];
  onUpdate: (theme: Theme) => void;
  onDelete: (id: string) => void;
  onAddInitiative: (data: { name: string; idealOutcome: string }) => void;
  onUpdateInitiative: (initiative: Initiative) => void;
  onDeleteInitiative: (id: string) => void;
  onAddFeature: (initiativeId: string, data: {
    name: string;
    description?: string;
    status: FeatureStatus;
    startDate?: string;
    endDate?: string;
  }) => void;
  onUpdateFeature: (feature: Feature) => void;
  onDeleteFeature: (id: string) => void;
}

export function ThemeItem({
  theme,
  initiatives,
  features,
  onUpdate,
  onDelete,
  onAddInitiative,
  onUpdateInitiative,
  onDeleteInitiative,
  onAddFeature,
  onUpdateFeature,
  onDeleteFeature,
}: ThemeItemProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingInitiative, setIsAddingInitiative] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const hasInitiatives = initiatives.length > 0;

  const handleUpdate = (data: { name: string; description?: string; desiredOutcome: string }) => {
    onUpdate({
      ...theme,
      ...data,
    });
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (hasInitiatives) return;
    onDelete(theme.id);
  };

  const getInitiativeFeatures = (initiativeId: string) => {
    return features.filter((f) => f.initiativeId === initiativeId).sort((a, b) => a.order - b.order);
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
      <div className="group flex items-start justify-between p-4 bg-gray-50 border-b border-gray-200">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-1 rounded p-0.5 text-gray-400 hover:bg-gray-200 hover:text-gray-600"
            aria-label={isExpanded ? 'Collapse' : 'Expand'}
          >
            <svg
              className={`h-5 w-5 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-semibold text-gray-900">{theme.name}</h3>
            {theme.description && (
              <p className="text-sm text-gray-600 mt-0.5">{theme.description}</p>
            )}
            <p className="text-sm text-gray-500 mt-1">→ {theme.desiredOutcome}</p>
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
            disabled={hasInitiatives}
            title={hasInitiatives ? 'Remove all initiatives first' : undefined}
          >
            Delete
          </Button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 space-y-2">
          {initiatives.length === 0 ? (
            <p className="text-sm text-gray-400 italic">No initiatives yet</p>
          ) : (
            initiatives.map((initiative) => (
              <InitiativeItem
                key={initiative.id}
                initiative={initiative}
                features={getInitiativeFeatures(initiative.id)}
                onUpdate={onUpdateInitiative}
                onDelete={onDeleteInitiative}
                onAddFeature={(data) => onAddFeature(initiative.id, data)}
                onUpdateFeature={onUpdateFeature}
                onDeleteFeature={onDeleteFeature}
              />
            ))
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
      )}

      <Modal
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        title="Edit Theme"
      >
        <ThemeForm
          theme={theme}
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
        title="Delete Theme"
        message={
          hasInitiatives
            ? `Cannot delete "${theme.name}" because it has ${initiatives.length} initiative(s). Remove all initiatives first.`
            : `Are you sure you want to delete "${theme.name}"? This action cannot be undone.`
        }
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
}

import { useState } from 'react';
import { Button, Badge, Modal, ConfirmDialog } from '../ui';
import { FeatureForm } from './FeatureForm';
import type { Feature, FeatureStatus } from '../../types';

interface FeatureItemProps {
  feature: Feature;
  onUpdate: (feature: Feature) => void;
  onDelete: (id: string) => void;
}

export function FeatureItem({ feature, onUpdate, onDelete }: FeatureItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const formatDateRange = () => {
    if (!feature.startDate && !feature.endDate) return null;
    const start = feature.startDate ? new Date(feature.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '?';
    const end = feature.endDate ? new Date(feature.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '?';
    return `${start} - ${end}`;
  };

  const handleUpdate = (data: {
    name: string;
    description?: string;
    status: FeatureStatus;
    startDate?: string;
    endDate?: string;
  }) => {
    onUpdate({
      ...feature,
      ...data,
    });
    setIsEditing(false);
  };

  return (
    <>
      <div className="flex items-center justify-between py-2 pl-4 pr-2 hover:bg-gray-50 rounded">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <span className="text-gray-400">•</span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-900 truncate">{feature.name}</span>
              <Badge status={feature.status} />
            </div>
            {formatDateRange() && (
              <span className="text-xs text-gray-500">{formatDateRange()}</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 hover:opacity-100">
          <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
            Edit
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setShowDeleteConfirm(true)}>
            Delete
          </Button>
        </div>
      </div>

      <Modal
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        title="Edit Feature"
      >
        <FeatureForm
          feature={feature}
          onSubmit={handleUpdate}
          onCancel={() => setIsEditing(false)}
        />
      </Modal>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={() => onDelete(feature.id)}
        title="Delete Feature"
        message={`Are you sure you want to delete "${feature.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
      />
    </>
  );
}

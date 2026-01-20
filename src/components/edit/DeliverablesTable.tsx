import { useState } from 'react';
import { Button, Badge, Modal, ConfirmDialog } from '../ui';
import { DeliverableForm } from './DeliverableForm';
import type { Deliverable, DeliverableStatus } from '../../types';

interface DeliverablesTableProps {
  deliverables: Deliverable[];
  onUpdate: (deliverable: Deliverable) => void;
  onDelete: (id: string) => void;
  onAdd: (data: {
    name: string;
    description?: string;
    status: DeliverableStatus;
    startDate?: string;
    endDate?: string;
  }) => void;
}

export function DeliverablesTable({
  deliverables,
  onUpdate,
  onDelete,
  onAdd,
}: DeliverablesTableProps) {
  const [editingDeliverable, setEditingDeliverable] = useState<Deliverable | null>(null);
  const [deletingDeliverable, setDeletingDeliverable] = useState<Deliverable | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const formatDateRange = (deliverable: Deliverable) => {
    if (!deliverable.startDate && !deliverable.endDate) return '—';
    const formatDate = (date: string) => {
      return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };
    const start = deliverable.startDate ? formatDate(deliverable.startDate) : '?';
    const end = deliverable.endDate ? formatDate(deliverable.endDate) : '?';
    return `${start} → ${end}`;
  };

  const handleUpdate = (data: {
    name: string;
    description?: string;
    status: DeliverableStatus;
    startDate?: string;
    endDate?: string;
  }) => {
    if (editingDeliverable) {
      onUpdate({ ...editingDeliverable, ...data });
      setEditingDeliverable(null);
    }
  };

  return (
    <>
      <div className="mt-2 overflow-hidden rounded-md border border-gray-200">
        <table className="w-full table-fixed divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="w-[45%] px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Name
              </th>
              <th className="w-[25%] px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Dates
              </th>
              <th className="w-[15%] px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Status
              </th>
              <th className="w-[15%] px-3 py-2 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {deliverables.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-3 py-4 text-center text-sm text-gray-400 italic">
                  No deliverables yet
                </td>
              </tr>
            ) : (
              deliverables.map((deliverable) => (
                <tr key={deliverable.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2">
                    <div className="text-sm font-medium text-gray-900 truncate">{deliverable.name}</div>
                    {deliverable.description && (
                      <div className="text-xs text-gray-500 truncate">{deliverable.description}</div>
                    )}
                  </td>
                  <td className="px-3 py-2 text-sm text-gray-600 whitespace-nowrap">
                    {formatDateRange(deliverable)}
                  </td>
                  <td className="px-3 py-2">
                    <Badge status={deliverable.status} />
                  </td>
                  <td className="px-3 py-2 text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingDeliverable(deliverable)}
                        title="Edit"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeletingDeliverable(deliverable)}
                        title="Delete"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsAdding(true)}
        className="mt-2 text-gray-500"
      >
        + Add Deliverable
      </Button>

      <Modal
        isOpen={editingDeliverable !== null}
        onClose={() => setEditingDeliverable(null)}
        title="Edit Deliverable"
      >
        {editingDeliverable && (
          <DeliverableForm
            deliverable={editingDeliverable}
            onSubmit={handleUpdate}
            onCancel={() => setEditingDeliverable(null)}
          />
        )}
      </Modal>

      <Modal
        isOpen={isAdding}
        onClose={() => setIsAdding(false)}
        title="Add Deliverable"
      >
        <DeliverableForm
          onSubmit={(data) => {
            onAdd(data);
            setIsAdding(false);
          }}
          onCancel={() => setIsAdding(false)}
        />
      </Modal>

      <ConfirmDialog
        isOpen={deletingDeliverable !== null}
        onClose={() => setDeletingDeliverable(null)}
        onConfirm={() => {
          if (deletingDeliverable) {
            onDelete(deletingDeliverable.id);
            setDeletingDeliverable(null);
          }
        }}
        title="Delete Deliverable"
        message={`Are you sure you want to delete "${deletingDeliverable?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
      />
    </>
  );
}

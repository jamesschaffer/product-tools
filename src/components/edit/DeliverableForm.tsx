import { useState, type FormEvent } from 'react';
import { Button, Input, Textarea, Select } from '../ui';
import type { Deliverable, DeliverableStatus } from '../../types';

interface DeliverableFormProps {
  deliverable?: Deliverable;
  onSubmit: (data: {
    name: string;
    description?: string;
    status: DeliverableStatus;
    startDate?: string;
    endDate?: string;
  }) => void;
  onCancel: () => void;
}

const statusOptions = [
  { value: 'planned', label: 'Planned' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'shipped', label: 'Shipped' },
];

export function DeliverableForm({ deliverable, onSubmit, onCancel }: DeliverableFormProps) {
  const [name, setName] = useState(deliverable?.name || '');
  const [description, setDescription] = useState(deliverable?.description || '');
  const [status, setStatus] = useState<DeliverableStatus>(deliverable?.status || 'planned');
  const [startDate, setStartDate] = useState(deliverable?.startDate || '');
  const [endDate, setEndDate] = useState(deliverable?.endDate || '');
  const [dateError, setDateError] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
      setDateError('End date must be after start date');
      return;
    }

    setDateError('');
    onSubmit({
      name: name.trim(),
      description: description.trim() || undefined,
      status,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Deliverable Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="e.g., User Authentication"
        required
        autoFocus
      />
      <Textarea
        label="Description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Brief description of this deliverable"
      />
      <Select
        label="Status"
        value={status}
        onChange={(e) => setStatus(e.target.value as DeliverableStatus)}
        options={statusOptions}
      />
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Start Date"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <Input
          label="End Date"
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          error={dateError}
        />
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary">
          {deliverable ? 'Save Changes' : 'Add Deliverable'}
        </Button>
      </div>
    </form>
  );
}

import { useState, type FormEvent } from 'react';
import { Button, Input, Textarea, Select } from '../ui';
import type { Feature, FeatureStatus } from '../../types';

interface FeatureFormProps {
  feature?: Feature;
  onSubmit: (data: {
    name: string;
    description?: string;
    status: FeatureStatus;
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

export function FeatureForm({ feature, onSubmit, onCancel }: FeatureFormProps) {
  const [name, setName] = useState(feature?.name || '');
  const [description, setDescription] = useState(feature?.description || '');
  const [status, setStatus] = useState<FeatureStatus>(feature?.status || 'planned');
  const [startDate, setStartDate] = useState(feature?.startDate || '');
  const [endDate, setEndDate] = useState(feature?.endDate || '');
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
        label="Feature Name"
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
        placeholder="Brief description of this feature"
      />
      <Select
        label="Status"
        value={status}
        onChange={(e) => setStatus(e.target.value as FeatureStatus)}
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
          {feature ? 'Save Changes' : 'Add Feature'}
        </Button>
      </div>
    </form>
  );
}

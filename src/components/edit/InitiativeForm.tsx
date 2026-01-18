import { useState, type FormEvent } from 'react';
import { Button, Input, Textarea } from '../ui';
import type { Initiative } from '../../types';

interface InitiativeFormProps {
  initiative?: Initiative;
  onSubmit: (data: { name: string; idealOutcome: string }) => void;
  onCancel: () => void;
}

export function InitiativeForm({ initiative, onSubmit, onCancel }: InitiativeFormProps) {
  const [name, setName] = useState(initiative?.name || '');
  const [idealOutcome, setIdealOutcome] = useState(initiative?.idealOutcome || '');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !idealOutcome.trim()) return;

    onSubmit({
      name: name.trim(),
      idealOutcome: idealOutcome.trim(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Initiative Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="e.g., API Redesign"
        required
        autoFocus
      />
      <Textarea
        label="Ideal Outcome"
        value={idealOutcome}
        onChange={(e) => setIdealOutcome(e.target.value)}
        placeholder="What does success look like for this initiative?"
        required
      />
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary">
          {initiative ? 'Save Changes' : 'Add Initiative'}
        </Button>
      </div>
    </form>
  );
}

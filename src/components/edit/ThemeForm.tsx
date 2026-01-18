import { useState, type FormEvent } from 'react';
import { Button, Input, Textarea } from '../ui';
import type { Theme } from '../../types';

interface ThemeFormProps {
  theme?: Theme;
  onSubmit: (data: { name: string; description?: string; desiredOutcome: string }) => void;
  onCancel: () => void;
}

export function ThemeForm({ theme, onSubmit, onCancel }: ThemeFormProps) {
  const [name, setName] = useState(theme?.name || '');
  const [description, setDescription] = useState(theme?.description || '');
  const [desiredOutcome, setDesiredOutcome] = useState(theme?.desiredOutcome || '');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !desiredOutcome.trim()) return;

    onSubmit({
      name: name.trim(),
      description: description.trim() || undefined,
      desiredOutcome: desiredOutcome.trim(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Theme Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="e.g., Platform Modernization"
        required
        autoFocus
      />
      <Textarea
        label="Description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Brief description of this theme"
      />
      <Textarea
        label="Desired Outcome"
        value={desiredOutcome}
        onChange={(e) => setDesiredOutcome(e.target.value)}
        placeholder="What does success look like for this theme?"
        required
      />
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary">
          {theme ? 'Save Changes' : 'Add Theme'}
        </Button>
      </div>
    </form>
  );
}

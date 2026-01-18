import { useState, useEffect } from 'react';
import { useRoadmap } from '../../context';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import type { ColorTheme } from '../../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const fontOptions = [
  { value: 'system-ui', label: 'System Default' },
  { value: 'Georgia, serif', label: 'Serif' },
  { value: 'ui-monospace, monospace', label: 'Monospace' },
];

const colorThemeOptions: { value: ColorTheme; label: string }[] = [
  { value: 'teal', label: 'Teal' },
  { value: 'blue', label: 'Blue' },
  { value: 'green', label: 'Green' },
  { value: 'purple', label: 'Purple' },
  { value: 'orange', label: 'Orange' },
  { value: 'slate', label: 'Slate' },
];

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { state, dispatch } = useRoadmap();
  const { roadmap } = state;

  const [title, setTitle] = useState(roadmap.title);
  const [viewStartDate, setViewStartDate] = useState(roadmap.settings.viewStartDate);
  const [fontFamily, setFontFamily] = useState(roadmap.settings.fontFamily);
  const [colorTheme, setColorTheme] = useState(roadmap.settings.colorTheme);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTitle(roadmap.title);
      setViewStartDate(roadmap.settings.viewStartDate);
      setFontFamily(roadmap.settings.fontFamily);
      setColorTheme(roadmap.settings.colorTheme);
    }
  }, [isOpen, roadmap]);

  const handleSave = () => {
    if (title !== roadmap.title) {
      dispatch({ type: 'UPDATE_TITLE', payload: title });
    }
    dispatch({
      type: 'UPDATE_SETTINGS',
      payload: {
        viewStartDate,
        fontFamily,
        colorTheme,
      },
    });
    onClose();
  };

  const handleReset = () => {
    dispatch({ type: 'RESET_ROADMAP' });
    setShowResetConfirm(false);
    onClose();
  };

  const handleExportJson = () => {
    const dataStr = JSON.stringify(roadmap, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${roadmap.title.replace(/\s+/g, '-').toLowerCase()}-roadmap.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (imported.themes && imported.initiatives && imported.features) {
          dispatch({ type: 'IMPORT_ROADMAP', payload: imported });
          onClose();
        } else {
          alert('Invalid roadmap file format');
        }
      } catch {
        alert('Failed to parse JSON file');
      }
    };
    reader.readAsText(file);
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Settings">
        <div className="space-y-4">
          <Input
            label="Roadmap Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <Input
            label="Gantt View Start Date"
            type="date"
            value={viewStartDate}
            onChange={(e) => setViewStartDate(e.target.value)}
          />

          <Select
            label="Font Family"
            value={fontFamily}
            onChange={(e) => setFontFamily(e.target.value)}
            options={fontOptions}
          />

          <Select
            label="Color Theme"
            value={colorTheme}
            onChange={(e) => setColorTheme(e.target.value as ColorTheme)}
            options={colorThemeOptions}
          />

          <div className="border-t border-gray-200 pt-4">
            <h3 className="mb-2 text-sm font-medium text-gray-700">Data Management</h3>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={handleExportJson}>
                Export JSON
              </Button>
              <label className="inline-flex cursor-pointer items-center justify-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50">
                Import JSON
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportJson}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <Button
              variant="danger"
              onClick={() => setShowResetConfirm(true)}
            >
              Reset All Data
            </Button>
          </div>

          <div className="flex justify-end gap-2 border-t border-gray-200 pt-4">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        onConfirm={handleReset}
        title="Reset All Data"
        message="This will delete all themes, initiatives, and features. This action cannot be undone."
        confirmLabel="Reset"
      />
    </>
  );
}

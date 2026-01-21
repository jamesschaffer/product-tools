import { useState, useEffect } from 'react';
import { useRoadmap } from '../../context';
import { useAuth } from '../../hooks/useAuth';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
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
  const { state, updateSettings, updateTitle, refreshData } = useRoadmap();
  const { logout, authRequired } = useAuth();
  const { roadmap } = state;

  const [title, setTitle] = useState(roadmap.title);
  const [fontFamily, setFontFamily] = useState(roadmap.settings.fontFamily);
  const [colorTheme, setColorTheme] = useState(roadmap.settings.colorTheme);

  useEffect(() => {
    if (isOpen) {
      setTitle(roadmap.title);
      setFontFamily(roadmap.settings.fontFamily);
      setColorTheme(roadmap.settings.colorTheme);
    }
  }, [isOpen, roadmap]);

  const handleSave = () => {
    if (title !== roadmap.title) {
      updateTitle(title);
    }
    updateSettings({
      fontFamily,
      colorTheme,
    });
    onClose();
  };

  const handleRefresh = () => {
    refreshData();
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
            <h3 className="mb-2 text-sm font-medium text-gray-700">Notion Connection</h3>
            <Button variant="secondary" onClick={handleRefresh}>
              Refresh Data from Notion
            </Button>
            <p className="mt-2 text-xs text-gray-500">
              Connection is configured via environment variables on the server.
            </p>
          </div>

          {authRequired && (
            <div className="border-t border-gray-200 pt-4">
              <h3 className="mb-2 text-sm font-medium text-gray-700">Session</h3>
              <Button variant="danger" onClick={logout}>
                Sign Out
              </Button>
            </div>
          )}

          <div className="flex justify-end gap-2 border-t border-gray-200 pt-4">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </div>
        </div>
      </Modal>

    </>
  );
}

import { useState } from 'react';
import { useRoadmapData } from '../../context';
import { ViewSwitcher } from './ViewSwitcher';
import { SettingsModal } from '../settings';
import { ExportModal } from '../export';

export function Toolbar() {
  const roadmap = useRoadmapData();
  const [showSettings, setShowSettings] = useState(false);
  const [showExport, setShowExport] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white px-6 py-4 print:hidden">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">{roadmap.title}</h1>
          <div className="flex items-center gap-4">
            <ViewSwitcher />
            <button
              type="button"
              onClick={() => setShowSettings(true)}
              className="rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            >
              Settings
            </button>
            <button
              type="button"
              onClick={() => setShowExport(true)}
              className="rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800"
            >
              Export
            </button>
          </div>
        </div>
      </header>

      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
      <ExportModal isOpen={showExport} onClose={() => setShowExport(false)} />
    </>
  );
}

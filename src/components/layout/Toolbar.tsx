import { useState, useEffect, useCallback } from 'react';
import { useRoadmap, useRoadmapData } from '../../context';
import { ViewSwitcher } from './ViewSwitcher';
import { SettingsModal } from '../settings';

export function Toolbar() {
  const roadmap = useRoadmapData();
  const { refreshData, state } = useRoadmap();
  const [showSettings, setShowSettings] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refreshData();
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshData]);

  // Refresh data when window regains focus
  useEffect(() => {
    const handleFocus = () => {
      handleRefresh();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [handleRefresh]);

  return (
    <>
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white px-6 py-4 print:hidden">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">{roadmap.title}</h1>
          <div className="flex items-center gap-4">
            <ViewSwitcher />
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isRefreshing || state.isLoading}
              className="rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 disabled:opacity-50"
              title="Sync with Notion"
            >
              {isRefreshing ? 'Syncing...' : 'Sync'}
            </button>
            <button
              type="button"
              onClick={() => setShowSettings(true)}
              className="rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            >
              Settings
            </button>
          </div>
        </div>
      </header>

      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </>
  );
}

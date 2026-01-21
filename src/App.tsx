import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { RoadmapProvider } from './context';
import { Toolbar } from './components/layout';
import { EditView } from './components/edit';
import { GanttView } from './components/gantt';
import { SlideView } from './components/slide';
import { SetupWizard } from './components/setup';
import { LoginPage } from './components/auth';
import { ErrorBoundary } from './components/error';
import { useNotionConfig } from './hooks/useNotionConfig';
import { useAuth } from './hooks/useAuth';

function AppRoutes() {
  const { isAuthenticated, authRequired, isLoading: authLoading, login } = useAuth();
  const { isConfigured, isLoading: configLoading } = useNotionConfig();
  const location = useLocation();

  // Show loading while checking auth and config
  if (authLoading || configLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
      </div>
    );
  }

  // If auth is required and not authenticated, show login
  if (authRequired && !isAuthenticated) {
    return <LoginPage onLogin={login} />;
  }

  // If not configured and not on setup page, redirect to setup
  if (!isConfigured && location.pathname !== '/setup') {
    return <Navigate to="/setup" replace />;
  }

  // If configured and on setup page, redirect to edit
  if (isConfigured && location.pathname === '/setup') {
    return <Navigate to="/edit" replace />;
  }

  // Setup page (no toolbar, no provider needed)
  if (location.pathname === '/setup') {
    return <SetupWizard />;
  }

  // Main app with toolbar and provider
  return (
    <RoadmapProvider>
      <div className="min-h-screen bg-gray-50">
        <Toolbar />
        <main>
          <ErrorBoundary>
            <Routes>
              <Route path="/" element={<Navigate to="/edit" replace />} />
              <Route path="/edit" element={<EditView />} />
              <Route path="/gantt" element={<GanttView />} />
              <Route path="/slide" element={<SlideView />} />
            </Routes>
          </ErrorBoundary>
        </main>
      </div>
    </RoadmapProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="*" element={<AppRoutes />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;

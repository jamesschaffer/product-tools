import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { RoadmapProvider } from './context';
import { Toolbar } from './components/layout';
import { EditView } from './components/edit';
import { GanttView } from './components/gantt';
import { SlideView } from './components/slide';

function App() {
  return (
    <RoadmapProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50">
          <Toolbar />
          <main>
            <Routes>
              <Route path="/" element={<Navigate to="/edit" replace />} />
              <Route path="/edit" element={<EditView />} />
              <Route path="/gantt" element={<GanttView />} />
              <Route path="/slide" element={<SlideView />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </RoadmapProvider>
  );
}

export default App;

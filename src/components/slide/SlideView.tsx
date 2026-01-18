import { useRoadmapData } from '../../context';
import { buildNestedStructure } from '../../utils';
import { ThemeColumn } from './ThemeColumn';
import { Legend } from './Legend';

export function SlideView() {
  const roadmap = useRoadmapData();
  const nestedData = buildNestedStructure(roadmap);

  if (roadmap.themes.length === 0) {
    return (
      <div className="p-6">
        <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
          <p className="text-gray-500">No data to display</p>
          <p className="mt-2 text-sm text-gray-400">
            Add themes and features in the Edit view
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div
        id="slide-export-container"
        className="max-w-[2000px] mx-auto p-6 md:p-10"
      >
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-800 mb-2">
            {roadmap.title}
          </h1>
          <p className="text-sm text-slate-500">
            Policy Lifecycle Capabilities & Investment Status
          </p>
        </div>

        <div className="flex gap-5 overflow-x-auto pb-4 mb-8">
          {nestedData.map((theme) => (
            <ThemeColumn key={theme.id} theme={theme} />
          ))}
        </div>

        <div className="border-t border-slate-200 pt-5">
          <Legend />
        </div>
      </div>
    </div>
  );
}

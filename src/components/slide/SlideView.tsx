import { useRoadmapData } from '../../context';
import { buildNestedStructure } from '../../utils';
import { GoalColumn } from './GoalColumn';
import { Legend } from './Legend';

export function SlideView() {
  const roadmap = useRoadmapData();
  const nestedData = buildNestedStructure(roadmap);

  if (roadmap.goals.length === 0) {
    return (
      <div className="p-6">
        <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
          <p className="text-gray-500">No data to display</p>
          <p className="mt-2 text-sm text-gray-400">
            Add goals and deliverables in the Editor
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div
        id="slide-export-container"
        className="py-6 pl-6"
      >
        <div className="mb-6">
          <h2 className="text-lg font-medium text-gray-900">Overview</h2>
          <p className="text-sm text-gray-500">
            Goals and initiatives by priority
          </p>
        </div>

        <div className="overflow-x-auto pb-4 mb-4">
          <div className="flex gap-3 w-fit pr-6">
            {nestedData.map((goal) => (
              <GoalColumn key={goal.id} goal={goal} />
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 text-slate-400 mb-4 pr-6">
          <div className="flex-1 h-px bg-slate-200" />
          <span className="text-xs uppercase tracking-wider">Priority</span>
          <div className="flex-1 h-px bg-slate-200" />
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </div>

        <div className="pt-2 pr-6">
          <Legend />
        </div>
      </div>
    </div>
  );
}

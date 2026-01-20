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
            Add goals and deliverables in the Edit view
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
          <h2 className="text-lg font-medium text-gray-900">Goal Review</h2>
          <p className="text-sm text-gray-500">
            Slide based view of Goals and Initiatives
          </p>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-4 mb-8">
          {nestedData.map((goal) => (
            <GoalColumn key={goal.id} goal={goal} />
          ))}
        </div>

        <div className="border-t border-slate-200 pt-5">
          <Legend />
        </div>
      </div>
    </div>
  );
}

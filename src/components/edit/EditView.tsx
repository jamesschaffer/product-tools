import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useRoadmap } from '../../context';
import { Button, Modal } from '../ui';
import { GoalForm } from './GoalForm';
import { SortableGoalItem } from './SortableGoalItem';
import type { Initiative, Deliverable, DeliverableStatus } from '../../types';

export function EditView() {
  const { state, dispatch } = useRoadmap();
  const { roadmap } = state;
  const [isAddingGoal, setIsAddingGoal] = useState(false);

  const sortedGoals = [...roadmap.goals].sort((a, b) => a.priority - b.priority);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const getGoalInitiatives = (goalId: string) => {
    return roadmap.initiatives
      .filter((i) => i.goalId === goalId)
      .sort((a, b) => a.order - b.order);
  };

  const getGoalDeliverables = (goalId: string) => {
    const initiativeIds = getGoalInitiatives(goalId).map((i) => i.id);
    return roadmap.deliverables.filter((d) => initiativeIds.includes(d.initiativeId));
  };

  const handleAddGoal = (data: { name: string; description?: string; desiredOutcome: string }) => {
    dispatch({ type: 'ADD_GOAL', payload: data });
    setIsAddingGoal(false);
  };

  const handleUpdateGoal = (goal: typeof roadmap.goals[0]) => {
    dispatch({ type: 'UPDATE_GOAL', payload: goal });
  };

  const handleDeleteGoal = (id: string) => {
    dispatch({ type: 'DELETE_GOAL', payload: id });
  };

  const handleAddInitiative = (goalId: string, data: { name: string; idealOutcome: string }) => {
    dispatch({ type: 'ADD_INITIATIVE', payload: { ...data, goalId } });
  };

  const handleUpdateInitiative = (initiative: Initiative) => {
    dispatch({ type: 'UPDATE_INITIATIVE', payload: initiative });
  };

  const handleDeleteInitiative = (id: string) => {
    dispatch({ type: 'DELETE_INITIATIVE', payload: id });
  };

  const handleAddDeliverable = (
    initiativeId: string,
    data: {
      name: string;
      description?: string;
      status: DeliverableStatus;
      startDate?: string;
      endDate?: string;
    }
  ) => {
    dispatch({ type: 'ADD_DELIVERABLE', payload: { ...data, initiativeId } });
  };

  const handleUpdateDeliverable = (deliverable: Deliverable) => {
    dispatch({ type: 'UPDATE_DELIVERABLE', payload: deliverable });
  };

  const handleDeleteDeliverable = (id: string) => {
    dispatch({ type: 'DELETE_DELIVERABLE', payload: id });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = sortedGoals.findIndex((g) => g.id === active.id);
      const newIndex = sortedGoals.findIndex((g) => g.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        // Calculate new priority based on new position (1-indexed)
        const newPriority = newIndex + 1;
        dispatch({ type: 'SET_GOAL_PRIORITY', payload: { id: active.id as string, newPriority } });
      }
    }
  };

  if (state.isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium text-gray-900">Roadmap Editor</h2>
          <p className="text-sm text-gray-500">
            Build and organize goals, initiatives, and deliverables
          </p>
        </div>
        <Button variant="primary" onClick={() => setIsAddingGoal(true)}>
          + Add Goal
        </Button>
      </div>

      {sortedGoals.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
          <p className="text-gray-500">No goals yet</p>
          <p className="text-sm text-gray-400 mt-1">
            Start by adding a goal to organize your roadmap
          </p>
          <Button
            variant="primary"
            onClick={() => setIsAddingGoal(true)}
            className="mt-4"
          >
            Add Your First Goal
          </Button>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sortedGoals.map((g) => g.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-4">
              {sortedGoals.map((goal) => (
                <SortableGoalItem
                  key={goal.id}
                  goal={goal}
                  initiatives={getGoalInitiatives(goal.id)}
                  deliverables={getGoalDeliverables(goal.id)}
                  onUpdate={handleUpdateGoal}
                  onDelete={handleDeleteGoal}
                  onAddInitiative={(data) => handleAddInitiative(goal.id, data)}
                  onUpdateInitiative={handleUpdateInitiative}
                  onDeleteInitiative={handleDeleteInitiative}
                  onAddDeliverable={handleAddDeliverable}
                  onUpdateDeliverable={handleUpdateDeliverable}
                  onDeleteDeliverable={handleDeleteDeliverable}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <Modal
        isOpen={isAddingGoal}
        onClose={() => setIsAddingGoal(false)}
        title="Add Goal"
      >
        <GoalForm
          onSubmit={handleAddGoal}
          onCancel={() => setIsAddingGoal(false)}
        />
      </Modal>
    </div>
  );
}

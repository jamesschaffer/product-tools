import type {
  Roadmap,
  GoalWithChildren,
  InitiativeWithChildren,
} from '../types';

export function buildNestedStructure(roadmap: Roadmap): GoalWithChildren[] {
  const sortedGoals = [...roadmap.goals].sort((a, b) => a.priority - b.priority);

  return sortedGoals.map((goal) => {
    const goalInitiatives = roadmap.initiatives
      .filter((i) => i.goalId === goal.id)
      .sort((a, b) => a.order - b.order);

    const initiativesWithDeliverables: InitiativeWithChildren[] = goalInitiatives.map(
      (initiative) => {
        const deliverables = roadmap.deliverables
          .filter((d) => d.initiativeId === initiative.id)
          .sort((a, b) => a.order - b.order);

        return {
          ...initiative,
          deliverables,
        };
      }
    );

    return {
      ...goal,
      initiatives: initiativesWithDeliverables,
    };
  });
}

export function getDeliverablesByStatus(roadmap: Roadmap) {
  const shipped = roadmap.deliverables.filter((d) => d.status === 'shipped').length;
  const inProgress = roadmap.deliverables.filter((d) => d.status === 'in-progress').length;
  const planned = roadmap.deliverables.filter((d) => d.status === 'planned').length;

  return { shipped, inProgress, planned, total: roadmap.deliverables.length };
}

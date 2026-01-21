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
  let shipped = 0;
  let inProgress = 0;
  let planned = 0;

  for (const deliverable of roadmap.deliverables) {
    switch (deliverable.status) {
      case 'shipped':
        shipped++;
        break;
      case 'in-progress':
        inProgress++;
        break;
      case 'planned':
        planned++;
        break;
    }
  }

  return { shipped, inProgress, planned, total: roadmap.deliverables.length };
}

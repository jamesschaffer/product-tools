import type { Deliverable, Roadmap, Goal, Initiative } from '../types';

export interface StackedDeliverable extends Deliverable {
  stackIndex: number;
}

export function calculateDeliverableStacking(deliverables: Deliverable[]): StackedDeliverable[] {
  const scheduled = deliverables.filter((d) => d.startDate && d.endDate);
  const sorted = [...scheduled].sort(
    (a, b) => new Date(a.startDate!).getTime() - new Date(b.startDate!).getTime()
  );

  const stacked: StackedDeliverable[] = [];
  const rows: { endDate: Date }[] = [];

  for (const deliverable of sorted) {
    const start = new Date(deliverable.startDate!);

    let rowIndex = rows.findIndex((row) => row.endDate <= start);

    if (rowIndex === -1) {
      rowIndex = rows.length;
      rows.push({ endDate: new Date(deliverable.endDate!) });
    } else {
      rows[rowIndex].endDate = new Date(deliverable.endDate!);
    }

    stacked.push({ ...deliverable, stackIndex: rowIndex });
  }

  return stacked;
}

export interface GanttRowData {
  goal: Goal;
  initiative: Initiative;
  scheduledDeliverables: StackedDeliverable[];
  unscheduledDeliverables: Deliverable[];
  maxStackIndex: number;
  isFirstInitiativeInGoal: boolean;
  initiativeCountInGoal: number;
}

export function buildGanttRows(roadmap: Roadmap): GanttRowData[] {
  const rows: GanttRowData[] = [];

  const sortedGoals = [...roadmap.goals].sort((a, b) => a.order - b.order);

  for (const goal of sortedGoals) {
    const goalInitiatives = roadmap.initiatives
      .filter((i) => i.goalId === goal.id)
      .sort((a, b) => a.order - b.order);

    goalInitiatives.forEach((initiative, index) => {
      const initiativeDeliverables = roadmap.deliverables
        .filter((d) => d.initiativeId === initiative.id)
        .sort((a, b) => a.order - b.order);

      const scheduled = initiativeDeliverables.filter((d) => d.startDate && d.endDate);
      const unscheduled = initiativeDeliverables.filter((d) => !d.startDate || !d.endDate);

      const stackedDeliverables = calculateDeliverableStacking(scheduled);
      const maxStackIndex = stackedDeliverables.reduce(
        (max, d) => Math.max(max, d.stackIndex),
        -1
      );

      rows.push({
        goal,
        initiative,
        scheduledDeliverables: stackedDeliverables,
        unscheduledDeliverables: unscheduled,
        maxStackIndex,
        isFirstInitiativeInGoal: index === 0,
        initiativeCountInGoal: goalInitiatives.length,
      });
    });

    if (goalInitiatives.length === 0) {
      rows.push({
        goal,
        initiative: {
          id: `empty-${goal.id}`,
          goalId: goal.id,
          name: 'No initiatives',
          idealOutcome: '',
          order: 0,
        },
        scheduledDeliverables: [],
        unscheduledDeliverables: [],
        maxStackIndex: -1,
        isFirstInitiativeInGoal: true,
        initiativeCountInGoal: 0,
      });
    }
  }

  return rows;
}

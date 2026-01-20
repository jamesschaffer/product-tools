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
  isLastInitiativeInGoal: boolean;
  initiativeCountInGoal: number;
  rowHeight: number;
  goalTotalHeight: number;
  rowOffsetInGoal: number;
}

function calculateRowHeight(maxStackIndex: number): number {
  const barHeight = 24;
  const barGap = 4;
  const minTimelineHeight = 40;
  return Math.max(minTimelineHeight, (maxStackIndex + 1) * (barHeight + barGap) + 12);
}

export function buildGanttRows(roadmap: Roadmap): GanttRowData[] {
  const rows: GanttRowData[] = [];

  const sortedGoals = [...roadmap.goals].sort((a, b) => a.order - b.order);

  for (const goal of sortedGoals) {
    const goalInitiatives = roadmap.initiatives
      .filter((i) => i.goalId === goal.id)
      .sort((a, b) => a.order - b.order);

    // First pass: calculate row heights for this goal
    const goalRows: Array<{
      initiative: Initiative;
      stackedDeliverables: StackedDeliverable[];
      unscheduledDeliverables: Deliverable[];
      maxStackIndex: number;
      rowHeight: number;
    }> = [];

    for (const initiative of goalInitiatives) {
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

      goalRows.push({
        initiative,
        stackedDeliverables,
        unscheduledDeliverables: unscheduled,
        maxStackIndex,
        rowHeight: calculateRowHeight(maxStackIndex),
      });
    }

    // Calculate total height for the goal
    const goalTotalHeight = goalRows.reduce((sum, r) => sum + r.rowHeight, 0);

    // Second pass: create row data with offsets
    let rowOffsetInGoal = 0;
    goalRows.forEach((rowData, index) => {
      rows.push({
        goal,
        initiative: rowData.initiative,
        scheduledDeliverables: rowData.stackedDeliverables,
        unscheduledDeliverables: rowData.unscheduledDeliverables,
        maxStackIndex: rowData.maxStackIndex,
        isFirstInitiativeInGoal: index === 0,
        isLastInitiativeInGoal: index === goalRows.length - 1,
        initiativeCountInGoal: goalRows.length,
        rowHeight: rowData.rowHeight,
        goalTotalHeight,
        rowOffsetInGoal,
      });
      rowOffsetInGoal += rowData.rowHeight;
    });

    if (goalInitiatives.length === 0) {
      const rowHeight = calculateRowHeight(-1);
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
        isLastInitiativeInGoal: true,
        initiativeCountInGoal: 0,
        rowHeight,
        goalTotalHeight: rowHeight,
        rowOffsetInGoal: 0,
      });
    }
  }

  return rows;
}

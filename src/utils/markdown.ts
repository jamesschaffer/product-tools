import type { Roadmap, GoalWithChildren, DeliverableStatus } from '../types';

function formatStatus(status: DeliverableStatus): string {
  const statusMap: Record<DeliverableStatus, string> = {
    shipped: 'SHIPPED',
    'in-progress': 'IN PROGRESS',
    planned: 'PLANNED',
  };
  return statusMap[status];
}

export function generateOverviewMarkdown(
  roadmap: Roadmap,
  nestedData: GoalWithChildren[]
): string {
  const lines: string[] = [];

  lines.push(`# ${roadmap.title}`);
  lines.push('');

  for (const goal of nestedData) {
    lines.push('---');
    lines.push('');
    lines.push(`## [P${goal.priority}] ${goal.name}`);

    if (goal.description) {
      lines.push(`> ${goal.description}`);
      lines.push('');
    }

    lines.push(`**Desired Outcome:** ${goal.desiredOutcome}`);
    lines.push('');

    for (const initiative of goal.initiatives) {
      lines.push(`### ${initiative.name}`);
      lines.push(`**Ideal Outcome:** ${initiative.idealOutcome}`);
      lines.push('');

      if (initiative.deliverables.length > 0) {
        for (const deliverable of initiative.deliverables) {
          lines.push(`- [${formatStatus(deliverable.status)}] ${deliverable.name}`);
        }
        lines.push('');
      }
    }
  }

  return lines.join('\n');
}

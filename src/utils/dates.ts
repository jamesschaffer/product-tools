export function getQuarterStart(date: Date): Date {
  const quarter = Math.floor(date.getMonth() / 3);
  return new Date(date.getFullYear(), quarter * 3, 1);
}

export function getNextQuarterStart(date: Date): Date {
  const current = getQuarterStart(date);
  current.setMonth(current.getMonth() + 3);
  return current;
}

export function formatDateISO(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function dateToPercent(
  date: Date,
  viewStart: Date,
  viewMonths: number = 12
): number {
  const viewEnd = new Date(viewStart);
  viewEnd.setMonth(viewEnd.getMonth() + viewMonths);

  const totalMs = viewEnd.getTime() - viewStart.getTime();
  const dateMs = date.getTime() - viewStart.getTime();

  return (dateMs / totalMs) * 100;
}

export function percentToDate(
  percent: number,
  viewStart: Date,
  viewMonths: number = 12
): Date {
  const viewEnd = new Date(viewStart);
  viewEnd.setMonth(viewEnd.getMonth() + viewMonths);

  const totalMs = viewEnd.getTime() - viewStart.getTime();
  const dateMs = (percent / 100) * totalMs;

  return new Date(viewStart.getTime() + dateMs);
}

export interface MonthLabel {
  month: string;
  year: number;
  startPercent: number;
  widthPercent: number;
}

export interface QuarterLabel {
  quarter: string;
  year: number;
  startPercent: number;
  widthPercent: number;
}

export function generateMonthLabels(
  viewStart: Date,
  viewMonths: number = 12
): MonthLabel[] {
  const labels: MonthLabel[] = [];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  for (let i = 0; i < viewMonths; i++) {
    const monthDate = new Date(viewStart);
    monthDate.setMonth(viewStart.getMonth() + i);

    const nextMonth = new Date(monthDate);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    labels.push({
      month: monthNames[monthDate.getMonth()],
      year: monthDate.getFullYear(),
      startPercent: dateToPercent(monthDate, viewStart, viewMonths),
      widthPercent: dateToPercent(nextMonth, viewStart, viewMonths) - dateToPercent(monthDate, viewStart, viewMonths),
    });
  }

  return labels;
}

export function generateQuarterLabels(
  viewStart: Date,
  viewMonths: number = 12
): QuarterLabel[] {
  const labels: QuarterLabel[] = [];
  const quarterNames = ['Q1', 'Q2', 'Q3', 'Q4'];

  let current = new Date(viewStart);
  const viewEnd = new Date(viewStart);
  viewEnd.setMonth(viewEnd.getMonth() + viewMonths);

  while (current < viewEnd) {
    const quarterIndex = Math.floor(current.getMonth() / 3);
    const quarterStart = new Date(current.getFullYear(), quarterIndex * 3, 1);
    const quarterEnd = new Date(current.getFullYear(), (quarterIndex + 1) * 3, 1);

    const effectiveStart = quarterStart < viewStart ? viewStart : quarterStart;
    const effectiveEnd = quarterEnd > viewEnd ? viewEnd : quarterEnd;

    labels.push({
      quarter: quarterNames[quarterIndex],
      year: current.getFullYear(),
      startPercent: dateToPercent(effectiveStart, viewStart, viewMonths),
      widthPercent: dateToPercent(effectiveEnd, viewStart, viewMonths) - dateToPercent(effectiveStart, viewStart, viewMonths),
    });

    current = quarterEnd;
  }

  return labels;
}

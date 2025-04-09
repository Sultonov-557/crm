import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  addHours,
} from 'date-fns';

export function getAllFormattedDays(date: Date): string[] {
  const formattedDays: string[] = [];
  const startOfMonthDate = startOfMonth(addHours(date, 5));
  const endOfMonthDate = endOfMonth(addHours(date, 5));

  const daysInMonth = eachDayOfInterval({
    start: startOfMonthDate,
    end: endOfMonthDate,
  });

  daysInMonth.forEach((day) => {
    const formattedDay = format(day, 'yyyy-MM-dd');
    formattedDays.push(formattedDay);
  });

  return formattedDays;
}

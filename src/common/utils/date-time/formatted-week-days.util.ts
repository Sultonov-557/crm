import {
  format,
  eachDayOfInterval,
  addHours,
  startOfWeek,
  endOfWeek,
} from 'date-fns';

export function getFormattedWeekDays(date: Date): string[] {
  const formattedDays: string[] = [];
  const startOfWeekDate = startOfWeek(addHours(date, 5));
  const endOfWeekDate = endOfWeek(addHours(date, 5));

  const daysInWeek = eachDayOfInterval({
    start: startOfWeekDate,
    end: endOfWeekDate,
  });

  daysInWeek.forEach((day) => {
    const formattedDay = format(day, 'yyyy-MM-dd');
    formattedDays.push(formattedDay);
  });

  return formattedDays;
}

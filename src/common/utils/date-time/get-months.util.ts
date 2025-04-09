import { format, eachMonthOfInterval, addHours } from 'date-fns';

export function getAllFormattedMonths(year: number): string[] {
  const formattedMonths: string[] = [];
  const startOfYear = new Date(addHours(new Date(year, 0, 1), 5));
  const endOfYear = new Date(addHours(new Date(year, 11, 31), 5));

  const monthsInYear = eachMonthOfInterval({
    start: startOfYear,
    end: endOfYear,
  });

  monthsInYear.forEach((month) => {
    const formattedMonth = format(month, 'yyyy-MM');
    formattedMonths.push(formattedMonth);
  });

  return formattedMonths;
}

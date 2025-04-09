import { format, addHours } from 'date-fns';

export function getAllFormattedHours(date: Date): string[] {
  const formattedHours: string[] = [];
  const startOfTheDay = new Date(date.setHours(0, 0, 0, 0));

  for (let hour = 0; hour < 24; hour++) {
    const currentHour = addHours(startOfTheDay, hour);
    const formattedHour = format(currentHour, 'yyyy-MM-dd HH:00:00');
    formattedHours.push(formattedHour);
  }

  return formattedHours;
}

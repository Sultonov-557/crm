import { addHours } from 'date-fns';

export function getTimePeriodValues() {
  const time = new Date();
  return {
    day: time.setHours(5, 0, 0, 0).valueOf(),
    week: addHours(
      new Date(time.setDate(time.getDate() - time.getDay() + 1)),
      5,
    ).valueOf(),
    month: addHours(
      new Date(time.getFullYear(), time.getMonth(), 1),
      5,
    ).valueOf(),
    year: addHours(new Date(time.getFullYear(), 0, 1), 5).valueOf(),
    now: addHours(new Date(), 5).valueOf(),
  };
}

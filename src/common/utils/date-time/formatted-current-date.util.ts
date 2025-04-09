import { addHours } from 'date-fns';

export function getFormattedCurrentDate() {
  const currentDate = addHours(new Date(), 5);
  const day = currentDate.getDate().toString().padStart(2, '0');
  const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
  const year = currentDate.getFullYear();
  return `${day}-${month}-${year}`;
}

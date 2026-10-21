import { startOfWeek, endOfWeek, addDays, format, parseISO, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';

export function getWeekDays(date: Date): Date[] {
  // weekStartsOn: 1 (Monday)
  const monday = startOfWeek(date, { weekStartsOn: 1 });
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
}

export function formatDateIso(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export function formatDayHeader(date: Date): { dayName: string; dayNumber: string; isToday: boolean } {
  return {
    dayName: format(date, 'EEEE', { locale: es }),
    dayNumber: format(date, 'd MMM', { locale: es }),
    isToday: isSameDay(date, new Date()),
  };
}

export function formatWeekRange(startDate: Date): string {
  const start = startOfWeek(startDate, { weekStartsOn: 1 });
  const end = endOfWeek(startDate, { weekStartsOn: 1 });

  const sameMonth = format(start, 'MMM') === format(end, 'MMM');
  const year = format(start, 'yyyy');

  if (sameMonth) {
    return `${format(start, 'd', { locale: es })} - ${format(end, 'd', { locale: es })} de ${format(start, 'MMMM yyyy', { locale: es })}`;
  }
  return `${format(start, 'd MMM', { locale: es })} - ${format(end, 'd MMM yyyy', { locale: es })}`;
}

export function formatMonthYear(date: Date): string {
  return format(date, 'MMMM yyyy', { locale: es });
}

export function isDateToday(dateStr: string): boolean {
  try {
    return isSameDay(parseISO(dateStr), new Date());
  } catch {
    return false;
  }
}

export type DateFormat = 'short' | 'long';

export interface FormatDateOptions {
  format?: DateFormat;
  useWords?: boolean;
}

/**
 * Safely parse a date string into a Date object.
 * Handles ISO 8601 format (YYYY-MM-DD) explicitly for cross-browser compatibility.
 */
export function parseDate(dateString: string): Date {
  const isoDateRegex = /^(\d{4})-(\d{2})-(\d{2})/;
  const match = dateString.match(isoDateRegex);

  if (match) {
    const year = parseInt(match[1], 10);
    const month = parseInt(match[2], 10) - 1;
    const day = parseInt(match[3], 10);
    return new Date(year, month, day);
  }

  return new Date(dateString);
}

export function formatDate(
  dateString: string | null | undefined,
  options: FormatDateOptions = {}
): string {
  if (!dateString) return '';

  const { format = 'short' } = options;
  const date = parseDate(dateString);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const isSameDay = (d1: Date, d2: Date) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  if (options.useWords && isSameDay(date, today)) return 'Today';
  if (options.useWords && isSameDay(date, tomorrow)) return 'Tomorrow';

  const isCurrentYear = date.getFullYear() === today.getFullYear();

  if (format === 'short') {
    const dateOpts: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'short',
      ...(isCurrentYear ? {} : { year: 'numeric' }),
    };
    return date.toLocaleDateString('en-GB', dateOpts);
  } else {
    const dateOpts: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      ...(isCurrentYear ? {} : { year: 'numeric' }),
    };
    return date.toLocaleDateString('en-GB', dateOpts);
  }
}

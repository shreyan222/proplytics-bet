import { useGetProps } from '@/hooks/useGetProps';

/**
 * Hook to fetch props from prop_yday table for a specific date
 * @param date - The date string (YYYY-MM-DD) - will fetch props from the day before this date
 * @param leagues - Optional array of leagues to filter by
 */
export const useYesterdayProps = (date: string | null, leagues?: ('NBA' | 'NFL')[]) => {
  const enabled = !!date;

  if (!date) {
    return useGetProps(['yesterday-props', date, leagues], { table: 'prop_yday' }, false);
  }

  const selectedDate = new Date(date);
  const yesterday = new Date(selectedDate);
  yesterday.setDate(yesterday.getDate() - 1);

  const yesterdayStart = new Date(yesterday);
  yesterdayStart.setHours(0, 0, 0, 0);
  const yesterdayEnd = new Date(yesterdayStart);
  yesterdayEnd.setDate(yesterdayEnd.getDate() + 1);

  return useGetProps(
    ['yesterday-props', date, leagues],
    {
      table: 'prop_yday',
      filters: {
        gte: { created_at: yesterdayStart.toISOString() },
        lte: { created_at: yesterdayEnd.toISOString() },
        ...(leagues && leagues.length > 0 ? { in: { league: leagues } } : {}),
      },
      orderBy: [{ column: 'sorting_score_computed', ascending: false }],
    },
    enabled,
  );
};


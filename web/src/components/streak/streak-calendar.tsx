'use client';

import { useState, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isBefore, isAfter } from 'date-fns';
import { ChevronLeft, ChevronRight, Flame, Snowflake, X } from 'lucide-react';
import { cn } from '@/lib/utils/format';
import { Button } from '@/components/ui/button';
import type { Streak, StreakEvent } from '@/types';

interface StreakCalendarProps {
  streak: Streak;
  events: StreakEvent[];
  onDayClick?: (date: Date) => void;
}

export function StreakCalendar({ streak, events, onDayClick }: StreakCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const eventLookup = useMemo(() => {
    const lookup = new Map<string, { qualified: boolean; frozen?: boolean }>();
    events.forEach(e => {
      lookup.set(format(new Date(e.eventDate), 'yyyy-MM-dd'), {
        qualified: e.qualified,
        frozen: e.frozen
      });
    });
    return lookup;
  }, [events]);

  const getDayStatus = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const today = new Date();
    const isFuture = isAfter(date, today);

    if (isFuture) return 'future';

    const event = eventLookup.get(dateStr);
    if (event?.frozen) return 'frozen';
    if (event?.qualified) return 'active';
    return 'missed';
  };

  const handlePrevMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() - 1);
    setCurrentMonth(newMonth);
  };

  const handleNextMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + 1);
    setCurrentMonth(newMonth);
  };

  const handleToday = () => {
    setCurrentMonth(new Date());
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg">
          {format(currentMonth, 'MMMM yyyy')}
        </h3>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={handlePrevMonth}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleToday}>
            Today
          </Button>
          <Button variant="ghost" size="sm" onClick={handleNextMonth}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 text-center text-sm mb-2">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
          <div key={`${day}-${i}`} className="text-muted-foreground font-medium py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar days */}
      <div className="grid grid-cols-7 gap-1">
        {days.map(day => {
          const status = getDayStatus(day);
          const isToday = isSameDay(day, new Date());

          return (
            <button
              key={format(day, 'yyyy-MM-dd')}
              onClick={() => onDayClick?.(day)}
              disabled={status === 'future'}
              className={cn(
                'aspect-square rounded flex flex-col items-center justify-center relative',
                'hover:bg-gray-50 transition-colors',
                'disabled:opacity-40 disabled:hover:bg-transparent',
                isToday && 'ring-2 ring-primary ring-inset'
              )}
            >
              <span className="text-sm">{format(day, 'd')}</span>

              {status === 'active' && (
                <Flame className="w-4 h-4 text-orange-500" />
              )}
              {status === 'frozen' && (
                <Snowflake className="w-4 h-4 text-blue-500" />
              )}
              {status === 'missed' && (
                <X className="w-4 h-4 text-gray-300" />
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-4 mt-4 text-xs">
        <div className="flex items-center gap-1">
          <Flame className="w-3 h-3 text-orange-500" />
          <span>Active</span>
        </div>
        <div className="flex items-center gap-1">
          <Snowflake className="w-3 h-3 text-blue-500" />
          <span>Frozen</span>
        </div>
        <div className="flex items-center gap-1">
          <X className="w-3 h-3 text-gray-300" />
          <span>Missed</span>
        </div>
      </div>
    </div>
  );
}

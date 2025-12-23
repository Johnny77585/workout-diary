import React, { useMemo } from 'react';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { WorkoutLog } from '../types';

interface CalendarViewProps {
  log: WorkoutLog;
  onSelectDate: (date: string) => void;
  selectedDate: string;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ log, onSelectDate, selectedDate }) => {
  const [currentDate, setCurrentDate] = React.useState(new Date());

  const daysInMonth = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const date = new Date(year, month, 1);
    const days = [];
    while (date.getMonth() === month) {
      days.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }
    return days;
  }, [currentDate]);

  const firstDayOfWeek = daysInMonth[0].getDay();
  const padDays = Array(firstDayOfWeek).fill(null);

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };

  // Fix: Use local time explicitly to avoid timezone shifts from toISOString()
  const formatDateKey = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return (
    <div className="bg-slate-800 rounded-xl p-4 shadow-lg border border-slate-700">
      <div className="flex justify-between items-center mb-6">
        <button onClick={prevMonth} className="p-2 hover:bg-slate-700 rounded-full text-slate-300">
          <ChevronLeft size={20} />
        </button>
        <h2 className="text-xl font-bold text-white">
          {currentDate.toLocaleDateString('zh-TW', { year: 'numeric', month: 'long' })}
        </h2>
        <button onClick={nextMonth} className="p-2 hover:bg-slate-700 rounded-full text-slate-300">
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {['日', '一', '二', '三', '四', '五', '六'].map(d => (
          <div key={d} className="text-center text-slate-500 text-sm py-2 font-medium">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {padDays.map((_, i) => (
          <div key={`pad-${i}`} className="aspect-square" />
        ))}
        {daysInMonth.map((date) => {
          const dateKey = formatDateKey(date);
          const hasWorkout = log[dateKey] && log[dateKey].length > 0;
          const isSelected = dateKey === selectedDate;
          const today = isToday(date);

          return (
            <button
              key={dateKey}
              onClick={() => onSelectDate(dateKey)}
              className={`
                aspect-square rounded-xl flex flex-col items-center justify-center relative transition-all duration-200
                ${isSelected 
                  ? 'bg-primary text-slate-900 font-bold ring-2 ring-emerald-300 ring-offset-2 ring-offset-slate-800' 
                  : 'bg-slate-900/50 hover:bg-slate-700 text-slate-300'}
                ${today && !isSelected ? 'border border-primary text-primary' : ''}
              `}
            >
              <span className="text-sm">{date.getDate()}</span>
              {hasWorkout && (
                <div className={`mt-1 flex items-center justify-center ${isSelected ? 'text-slate-900' : 'text-primary'}`}>
                  <div className="w-1.5 h-1.5 rounded-full bg-current" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
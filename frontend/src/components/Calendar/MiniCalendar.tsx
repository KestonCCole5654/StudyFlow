import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../ui/button";

interface Session {
  id: string;
  title: string;
  date: Date;
  startTime: string;
  endTime: string;
}

interface MiniCalendarProps {
  currentDate: Date;
  onDateSelect: (date: Date) => void;
  sessions: Session[];
}

export function MiniCalendar({ currentDate, onDateSelect, sessions }: MiniCalendarProps) {
  const [displayDate, setDisplayDate] = useState(currentDate);
  const today = new Date();

  // Sync displayDate with external changes to currentDate
  React.useEffect(() => {
    setDisplayDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1));
  }, [currentDate]);

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const hasSessionsOnDate = (date: Date) => {
    return sessions.some((session) => {
      const sessionDate = new Date(session.date);
      return sessionDate.toDateString() === date.toDateString();
    });
  };

  const handlePrevMonth = () => {
    const newDate = new Date(displayDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setDisplayDate(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(displayDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setDisplayDate(newDate);
  };

  const daysInMonth = getDaysInMonth(displayDate);
  const firstDay = getFirstDayOfMonth(displayDate);
  const days = [];
  const weekdays = ["S", "M", "T", "W", "T", "F", "S"];

  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDay; i++) {
    days.push(<div key={`empty-${i}`} className="w-6 h-6 sm:w-8 sm:h-8"></div>);
  }

  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(displayDate.getFullYear(), displayDate.getMonth(), day);
    const isToday = date.toDateString() === today.toDateString();
    const isSelected = date.toDateString() === currentDate.toDateString();
    const hasSessions = hasSessionsOnDate(date);

    days.push(
      <button
        key={day}
        onClick={() => onDateSelect(date)}
        className={`w-6 h-6 sm:w-8 sm:h-8 text-xs sm:text-sm rounded-full flex items-center justify-center relative transition-colors ${
          isSelected
            ? "bg-indigo-600 text-white"
            : isToday
              ? "bg-indigo-500/20 text-indigo-300 font-medium"
              : "hover:bg-gray-800 text-gray-300"
        }`}
      >
        {day}
        {hasSessions && !isSelected && (
          <div className="absolute bottom-0 sm:bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-indigo-400 rounded-full"></div>
        )}
      </button>,
    );
  }

  return (
    <div className="bg-transparent">
      {/* Mini calendar header */}
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h3 className="text-xs sm:text-sm font-medium text-gray-100 truncate">
          <span className="hidden sm:inline">
            {displayDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </span>
          <span className="sm:hidden">
            {displayDate.toLocaleDateString("en-US", { month: "short", year: "2-digit" })}
          </span>
        </h3>
        <div className="flex items-center space-x-0.5 sm:space-x-1">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handlePrevMonth} 
            className="h-6 w-6 sm:h-7 sm:w-7 p-0 text-gray-400 hover:text-white hover:bg-gray-800"
          >
            <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleNextMonth} 
            className="h-6 w-6 sm:h-7 sm:w-7 p-0 text-gray-400 hover:text-white hover:bg-gray-800"
          >
            <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-0.5 sm:gap-1 mb-1 sm:mb-2">
        {weekdays.map((day, i) => (
          <div key={i} className="text-xs text-gray-400 text-center font-medium">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-0.5 sm:gap-1">{days}</div>
    </div>
  );
}
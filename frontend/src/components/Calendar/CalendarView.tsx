import React from "react";

interface Session {
  id: string;
  title: string;
  date: Date;
  startTime: string;
  endTime: string;
  color?: string;
}

interface CalendarViewProps {
  sessions: Session[];
  onDateSelect: (date: Date) => void;
  currentDate: Date;
  viewType: "month" | "week" | "day";
}

export function CalendarView({ sessions, onDateSelect, currentDate, viewType }: CalendarViewProps) {
  const today = new Date();

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getSessionsForDate = (date: Date) => {
    return sessions.filter((session) => {
      const sessionDate = new Date(session.date);
      return sessionDate.toDateString() === date.toDateString();
    });
  };

  const renderMonthView = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];
    const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-20 sm:h-32 border-r border-b border-gray-800"></div>);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const isToday = date.toDateString() === today.toDateString();
      const daysSessions = getSessionsForDate(date);

      days.push(
        <div
          key={day}
          className="h-20 sm:h-32 border-r border-b border-gray-800 p-1 sm:p-2 cursor-pointer hover:bg-gray-800 transition-colors"
          onClick={() => onDateSelect(date)}
        >
          <div
            className={`text-xs sm:text-sm font-medium mb-1 ${
              isToday 
                ? "bg-indigo-600 text-white w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-xs" 
                : "text-gray-300"
            }`}
          >
            {day}
          </div>
          <div className="space-y-0.5 sm:space-y-1">
            {daysSessions.slice(0, viewType === 'month' ? 2 : 3).map((session, index) => (
              <div
                key={session.id}
                className="text-xs p-0.5 sm:p-1 rounded bg-indigo-500/20 text-indigo-300 truncate"
                title={`${session.title} (${session.startTime} - ${session.endTime})`}
              >
                <span className="hidden sm:inline">{session.startTime} </span>
                <span className="truncate">{session.title}</span>
              </div>
            ))}
            {daysSessions.length > (viewType === 'month' ? 2 : 3) && (
              <div className="text-xs text-gray-400">
                +{daysSessions.length - (viewType === 'month' ? 2 : 3)} more
              </div>
            )}
          </div>
        </div>,
      );
    }

    return (
      <div className="flex flex-col h-full">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 border-b border-gray-800">
          {weekdays.map((day) => (
            <div
              key={day}
              className="p-2 sm:p-4 text-xs sm:text-sm font-medium text-gray-400 text-center border-r border-gray-800 last:border-r-0"
            >
              <span className="hidden sm:inline">{day}</span>
              <span className="sm:hidden">{day.charAt(0)}</span>
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 flex-1">{days}</div>
      </div>
    );
  };

  const renderWeekView = () => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());

    const weekDays: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      weekDays.push(date);
    }

    const hours = Array.from({ length: 24 }, (_, i) => i);

    return (
      <div className="flex flex-col h-full">
        {/* Week header */}
        <div className="grid grid-cols-8 border-b border-gray-800">
          <div className="p-2 sm:p-4 border-r border-gray-800"></div>
          {weekDays.map((date) => {
            const isToday = date.toDateString() === today.toDateString();
            return (
              <div key={date.toISOString()} className="p-2 sm:p-4 text-center border-r border-gray-800 last:border-r-0">
                <div className="text-xs sm:text-sm text-gray-400">
                  <span className="hidden sm:inline">{date.toLocaleDateString("en-US", { weekday: "short" })}</span>
                  <span className="sm:hidden">{date.toLocaleDateString("en-US", { weekday: "narrow" })}</span>
                </div>
                <div
                  className={`text-sm sm:text-lg font-medium ${
                    isToday 
                      ? "bg-indigo-600 text-white w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center mx-auto text-xs sm:text-base" 
                      : "text-gray-300"
                  }`}
                >
                  {date.getDate()}
                </div>
              </div>
            );
          })}
        </div>

        {/* Week grid */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-8">
            {hours.map((hour) => (
              <React.Fragment key={hour}>
                <div className="p-1 sm:p-2 text-xs text-gray-400 text-right border-r border-gray-800 h-12 sm:h-16 flex items-start justify-end">
                  <span className="hidden sm:inline">
                    {hour === 0 ? "12 AM" : hour < 12 ? `${hour} AM` : hour === 12 ? "12 PM" : `${hour - 12} PM`}
                  </span>
                  <span className="sm:hidden">
                    {hour === 0 ? "12a" : hour < 12 ? `${hour}a` : hour === 12 ? "12p" : `${hour - 12}p`}
                  </span>
                </div>
                {weekDays.map((date) => (
                  <div
                    key={`${date.toISOString()}-${hour}`}
                    className="border-r border-b border-gray-800 h-12 sm:h-16 cursor-pointer hover:bg-gray-800 relative"
                    onClick={() => onDateSelect(date)}
                  >
                    {getSessionsForDate(date)
                      .filter((session) => {
                        const sessionHour = Number.parseInt(session.startTime.split(":")[0]);
                        return sessionHour === hour;
                      })
                      .map((session) => (
                        <div
                          key={session.id}
                          className="absolute inset-x-0.5 sm:inset-x-1 top-0.5 sm:top-1 bg-indigo-500 text-white text-xs p-0.5 sm:p-1 rounded z-10"
                          title={`${session.title} (${session.startTime} - ${session.endTime})`}
                        >
                          <div className="truncate">{session.title}</div>
                        </div>
                      ))}
                  </div>
                ))}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderDayView = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const daysSessions = getSessionsForDate(currentDate);

    return (
      <div className="flex flex-col h-full">
        {/* Day header */}
        <div className="flex border-b border-gray-800">
          <div className="w-16 sm:w-20 p-2 sm:p-4 border-r border-gray-800"></div>
          <div className="flex-1 p-2 sm:p-4 text-center">
            <div className="text-xs sm:text-sm text-gray-400">
              <span className="hidden sm:inline">{currentDate.toLocaleDateString("en-US", { weekday: "long" })}</span>
              <span className="sm:hidden">{currentDate.toLocaleDateString("en-US", { weekday: "short" })}</span>
            </div>
            <div className="text-lg sm:text-2xl font-medium text-gray-300">{currentDate.getDate()}</div>
          </div>
        </div>

        {/* Day grid */}
        <div className="flex-1 overflow-y-auto">
          {hours.map((hour) => (
            <div key={hour} className="flex border-b border-gray-800 h-12 sm:h-16">
              <div className="w-16 sm:w-20 p-1 sm:p-2 text-xs text-gray-400 text-right border-r border-gray-800 flex items-start justify-end">
                <span className="hidden sm:inline">
                  {hour === 0 ? "12 AM" : hour < 12 ? `${hour} AM` : hour === 12 ? "12 PM" : `${hour - 12} PM`}
                </span>
                <span className="sm:hidden">
                  {hour === 0 ? "12a" : hour < 12 ? `${hour}a` : hour === 12 ? "12p" : `${hour - 12}p`}
                </span>
              </div>
              <div
                className="flex-1 cursor-pointer hover:bg-gray-800 relative"
                onClick={() => onDateSelect(currentDate)}
              >
                {daysSessions
                  .filter((session) => {
                    const sessionHour = Number.parseInt(session.startTime.split(":")[0]);
                    return sessionHour === hour;
                  })
                  .map((session) => (
                    <div
                      key={session.id}
                      className="absolute inset-x-1 sm:inset-x-2 top-0.5 sm:top-1 bg-indigo-600 text-white text-xs sm:text-sm p-1 sm:p-2 rounded"
                      title={`${session.title} (${session.startTime} - ${session.endTime})`}
                    >
                      <div className="font-medium truncate">{session.title}</div>
                      <div className="text-xs opacity-90 hidden sm:block">
                        {session.startTime} - {session.endTime}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full bg-transparent">
      {viewType === "month" && renderMonthView()}
      {viewType === "week" && renderWeekView()}
      {viewType === "day" && renderDayView()}
    </div>
  );
}
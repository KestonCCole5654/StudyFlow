import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { CalendarView } from "../components/Calendar/CalendarView";
import { MiniCalendar } from "../components/Calendar/MiniCalendar";
import { useSessions } from "../hooks/useSessions";
import { ChevronLeft, ChevronRight, Calendar, Menu, X } from "lucide-react";
import { Modal } from "../components/ui/Modal";

interface CalendarPageProps {
  onCreateSession: (date?: Date) => void;
  calendarSelectedDate?: Date | null;
  calendarShowModal?: boolean;
  onCalendarModalClose?: () => void;
}

type ViewType = "month" | "week" | "day";

interface MappedSession {
  id: string;
  title: string;
  date: Date;
  startTime: string;
  endTime: string;
}

export function CalendarPage({ onCreateSession, calendarSelectedDate, calendarShowModal, onCalendarModalClose }: CalendarPageProps) {
  const { sessions, loading, error } = useSessions();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewType, setViewType] = useState<ViewType>("month");
  const [selectedSessions, setSelectedSessions] = useState<MappedSession[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalDate, setModalDate] = useState<Date | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleDateSelect = (date: Date) => {
    const sessionsOnDate = mappedSessions.filter(s => s.date.toDateString() === date.toDateString());
    if (sessionsOnDate.length > 0) {
      setSelectedSessions(sessionsOnDate);
      setModalDate(date);
      setIsModalOpen(true);
    } else {
      onCreateSession(date);
    }
    // Close sidebar on mobile after selection
    setSidebarOpen(false);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedSessions([]);
    setModalDate(null);
    if (onCalendarModalClose) onCalendarModalClose();
  };

  const handlePrevious = () => {
    const newDate = new Date(currentDate);
    if (viewType === "month") {
      newDate.setMonth(newDate.getMonth() - 1);
    } else if (viewType === "week") {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setDate(newDate.getDate() - 1);
    }
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (viewType === "month") {
      newDate.setMonth(newDate.getMonth() + 1);
    } else if (viewType === "week") {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setDate(newDate.getDate() + 1);
    }
    setCurrentDate(newDate);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const formatCurrentPeriod = () => {
    if (viewType === "month") {
      return currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    } else if (viewType === "week") {
      const startOfWeek = new Date(currentDate);
      startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);

      if (startOfWeek.getMonth() === endOfWeek.getMonth()) {
        return `${startOfWeek.getDate()} – ${endOfWeek.getDate()} ${startOfWeek.toLocaleDateString("en-US", { month: "long", year: "numeric" })}`;
      } else {
        return `${startOfWeek.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${endOfWeek.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
      }
    } else {
      return currentDate.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    }
  };

  const mappedSessions: MappedSession[] = sessions.map((s) => {
    const dbDate = new Date(s.date || s.created_at);
    // Correct for timezone offset by creating a new date from UTC parts
    const localDate = new Date(dbDate.getUTCFullYear(), dbDate.getUTCMonth(), dbDate.getUTCDate());
    
    // The time is an artifact of TZ conversion from UTC midnight, but we keep it for display if needed
    const startTime = dbDate.toTimeString().slice(0, 5);
    const end = new Date(dbDate.getTime() + (s.duration_minutes || 60) * 60000);
    const endTime = end.toTimeString().slice(0, 5);
    return {
      id: s.id,
      title: s.title,
      date: localDate, // Use this for calendar date matching
      startTime,
      endTime,
    };
  });

  // Auto-open modal for calendarSelectedDate if requested
  useEffect(() => {
    if (calendarShowModal && calendarSelectedDate) {
      const sessionsOnDate = mappedSessions.filter(s => s.date.toDateString() === calendarSelectedDate.toDateString());
      setSelectedSessions(sessionsOnDate);
      setModalDate(calendarSelectedDate);
      setIsModalOpen(true);
    }
  }, [calendarShowModal, calendarSelectedDate, sessions]);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarOpen && window.innerWidth < 1024) {
        const sidebar = document.getElementById('calendar-sidebar');
        const menuButton = document.getElementById('mobile-menu-button');
        if (sidebar && !sidebar.contains(event.target as Node) && 
            menuButton && !menuButton.contains(event.target as Node)) {
          setSidebarOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [sidebarOpen]);

  if (loading) {
    return (
      <div className="space-y-6 lg:space-y-8 bg-gray-950 min-h-screen pb-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 lg:space-y-8 bg-gray-950 min-h-screen pb-8">
        <div className="bg-red-900/20 border border-red-700/30 rounded-lg p-6 max-w-md w-full">
          <p className="text-red-400">Error loading sessions: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 lg:space-y-8 bg-gray-950 min-h-screen pb-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-white truncate">Study Calendar</h1>
          <p className="text-sm sm:text-base text-gray-400 mt-1">
            Plan and organize your study sessions
          </p>
        </div>
        
        {/* Mobile menu button */}
        <button
          id="mobile-menu-button"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden flex items-center justify-center w-10 h-10 rounded-lg bg-gray-800 text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Calendar Navigation & Content */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3 sm:py-4 border-b border-t border-gray-800 space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-2 sm:space-x-4">
          <div className="flex items-center space-x-1 sm:space-x-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handlePrevious} 
              className="text-gray-300 hover:text-white hover:bg-gray-800 h-8 w-8 sm:h-9 sm:w-9"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleNext} 
              className="text-gray-300 hover:text-white hover:bg-gray-800 h-8 w-8 sm:h-9 sm:w-9"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <h2 className="text-lg sm:text-xl font-medium text-gray-100 truncate">
            <span className="hidden sm:inline">{formatCurrentPeriod()}</span>
            <span className="sm:hidden">
              {viewType === "month" && currentDate.toLocaleDateString("en-US", { month: "short", year: "2-digit" })}
              {viewType === "week" && "Week View"}
              {viewType === "day" && currentDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </span>
          </h2>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToday}
            className="text-gray-300 hover:text-white hover:bg-gray-800 text-xs sm:text-sm px-2 sm:px-3"
          >
            Today
          </Button>
          <div className="flex items-center border border-gray-700 rounded-lg bg-gray-900 overflow-hidden">
            <Button
              variant={viewType === "month" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewType("month")}
              className="rounded-none border-r border-gray-700 text-xs sm:text-sm px-2 sm:px-3 h-8 sm:h-9"
            >
              <span className="hidden sm:inline">Month</span>
              <span className="sm:hidden">M</span>
            </Button>
            <Button
              variant={viewType === "week" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewType("week")}
              className="rounded-none border-r border-gray-700 text-xs sm:text-sm px-2 sm:px-3 h-8 sm:h-9"
            >
              <span className="hidden sm:inline">Week</span>
              <span className="sm:hidden">W</span>
            </Button>
            <Button
              variant={viewType === "day" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewType("day")}
              className="rounded-none text-xs sm:text-sm px-2 sm:px-3 h-8 sm:h-9"
            >
              <span className="hidden sm:inline">Day</span>
              <span className="sm:hidden">D</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden mt-4 relative">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Sidebar */}
        <aside 
          id="calendar-sidebar"
          className={`
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            fixed lg:static inset-y-0 left-0 z-50 lg:z-auto
            w-64 sm:w-72 lg:w-64 xl:w-72
            border-r border-gray-800 bg-gray-900/95 lg:bg-gray-900/50 
            p-3 sm:p-4 overflow-y-auto
            transition-transform duration-300 ease-in-out
            backdrop-blur-sm lg:backdrop-blur-none
          `}
        >
          <div className="lg:hidden flex items-center justify-between mb-4 pb-4 border-b border-gray-700">
            <h3 className="text-lg font-semibold text-white">Calendar</h3>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <MiniCalendar 
            currentDate={currentDate} 
            onDateSelect={(date) => {
              setCurrentDate(date);
              setSidebarOpen(false);
            }} 
            sessions={mappedSessions} 
          />
        </aside>

        {/* Main Calendar */}
        <main className={`
          flex-1 overflow-hidden bg-gray-900/30 
          ${sidebarOpen ? 'lg:ml-0' : ''}
          transition-all duration-300 ease-in-out
        `}>
          <div className="h-full min-h-[500px] sm:min-h-[600px]">
            <CalendarView
              sessions={mappedSessions}
              onDateSelect={handleDateSelect}
              currentDate={currentDate}
              viewType={viewType}
            />
          </div>
        </main>
      </div>

      {/* Session Details Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={`Sessions for ${modalDate?.toLocaleDateString('en-US', { month: 'long', day: 'numeric' }) ?? ''}`}
      >
        <div className="space-y-4 overflow-y-auto max-h-[70vh]">
          {selectedSessions.map(session => {
            // Find the full session object to get duration and breaks
            const fullSession = sessions.find(s => s.id === session.id);
            return (
              <div key={session.id} className="bg-gray-800 p-4 rounded-lg">
                <h4 className="font-bold text-lg text-white">{session.title}</h4>
                <p className="text-gray-300 mb-2">
                  Duration: {fullSession?.duration_minutes ?? 'N/A'} min
                </p>
                {fullSession?.breaks && fullSession.breaks.length > 0 && (
                  <div className="mt-2">
                    <div className="text-sm text-primary-400 font-semibold mb-1">Planned Breaks</div>
                    <ul className="space-y-1">
                      {fullSession.breaks.map((brk, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm text-primary-200 bg-primary-900/20 rounded px-3 py-1">
                          <span className="font-bold">Break #{idx + 1}:</span>
                          <span>Start at {brk.startAfterMinutes} min</span>
                          <span>•</span>
                          <span>Duration {brk.durationMinutes} min</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Modal>
    </div>
  );
}
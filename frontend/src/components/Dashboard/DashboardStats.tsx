import { Clock, CheckCircle, BookOpen, TrendingUp } from 'lucide-react';
import { StudySession } from '../../types/database';

interface DashboardStatsProps {
  sessions: StudySession[];
}

export function DashboardStats({ sessions }: DashboardStatsProps) {
  const completedSessions = sessions.filter(s => s.completed);
  const totalMinutes = completedSessions.reduce((sum, s) => sum + s.duration_minutes, 0);
  const averageSessionLength = completedSessions.length > 0 
    ? Math.round(totalMinutes / completedSessions.length) 
    : 0;

  const stats = [
    {
      label: 'Total Sessions',
      value: sessions.length.toString(),
      icon: BookOpen,
      color: 'bg-primary-500',
      bgColor: 'bg-primary-900/40',
    },
    {
      label: 'Completed',
      value: completedSessions.length.toString(),
      icon: CheckCircle,
      color: 'bg-secondary-500',
      bgColor: 'bg-secondary-900/40',
    },
    {
      label: 'Study Hours',
      value: `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`,
      icon: Clock,
      color: 'bg-accent-500',
      bgColor: 'bg-accent-900/40',
    },
    {
      label: 'Avg. Session',
      value: `${averageSessionLength}min`,
      icon: TrendingUp,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-900/40',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-700/40 transition-shadow duration-200"
        >
          <div className="flex flex-col sm:flex-row sm:items-center">
            <div className={`${stat.bgColor} p-2 sm:p-3 rounded-lg sm:rounded-xl mb-3 sm:mb-0 self-start`}>
              <stat.icon className={`w-4 h-4 sm:w-6 sm:h-6 ${stat.color.replace('bg-', 'text-')}`} />
            </div>
            <div className="sm:ml-4">
              <p className="text-xs sm:text-sm font-medium text-gray-300">{stat.label}</p>
              <p className="text-lg sm:text-2xl font-bold text-white">{stat.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
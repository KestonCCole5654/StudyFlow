import { BookOpen, Calendar, Clock, LogOut, List, ChevronLeft, ChevronRight, Settings, Brain, Menu, X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';

interface SidebarProps {
  currentView: string;
  onCreateSession: () => void;
  isCollapsed: boolean;
  toggleSidebar: () => void;
}

export function Sidebar({ currentView, onCreateSession, isCollapsed, toggleSidebar }: SidebarProps) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BookOpen },
    { id: 'sessions', label: 'Sessions', icon: List },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'timer', label: 'Timer', icon: Clock },
    { id: 'quiz-hub', label: 'Quiz Hub', icon: Brain },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleNavigation = (itemId: string) => {
    navigate('/' + itemId);
    setIsMobileMenuOpen(false); // Close mobile menu after navigation
  };

  const handleSignOut = () => {
    signOut();
    setIsMobileMenuOpen(false);
  };

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMobileMenuOpen) {
        const mobileMenu = document.getElementById('mobile-menu');
        const menuButton = document.getElementById('mobile-menu-button');
        
        if (mobileMenu && !mobileMenu.contains(event.target as Node) && 
            menuButton && !menuButton.contains(event.target as Node)) {
          setIsMobileMenuOpen(false);
        }
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Prevent body scroll when menu is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <>
      {/* Mobile Top Navigation */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-gray-900 border-b border-gray-700/40 shadow-lg">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <span className="text-xl font-bold font-ordinary" style={{ color: '#5651e9' }}>StudyFlow</span>
          </div>

          {/* Mobile Menu Button */}
          <button
            id="mobile-menu-button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu Dropdown - Full Screen Overlay */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 top-16 z-40 bg-gray-950">
            <div 
              id="mobile-menu"
              className="h-full overflow-y-auto bg-gray-950"
              style={{ 
                maxHeight: 'calc(100vh - 4rem)', // Account for top nav height
              }}
            >
              <div className="px-4 py-6 space-y-2 bg-gray-950">
                {/* Navigation Items */}
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleNavigation(item.id)}
                    className={`flex items-center w-full px-4 py-4 rounded-xl text-base font-medium transition-all duration-200 ${
                      location.pathname.substring(1) === item.id
                        ? 'bg-primary-700/40 text-white shadow-lg border border-primary-600/30'
                        : 'text-gray-300 hover:text-white hover:bg-gray-800/80 active:bg-gray-700/80'
                    }`}
                  >
                    <item.icon className="mr-4 flex-shrink-0 w-6 h-6" />
                    <span className="text-lg">{item.label}</span>
                  </button>
                ))}
                
                {/* Spacer */}
                <div className="h-8"></div>
                
                {/* User Section */}
                <div className="border-t border-gray-700/50 pt-6 space-y-4">
                  {user && (
                    <div className="px-4 py-3 text-sm text-gray-300 bg-gray-800/80 rounded-xl border border-gray-700/30">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {user.email ? user.email[0].toUpperCase() : 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium">Signed in as</p>
                          <p className="text-gray-400 truncate text-xs">{user.email}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <button
                    onClick={handleSignOut}
                    className="flex items-center w-full px-4 py-4 text-gray-300 hover:text-white hover:bg-red-900/30 hover:border-red-700/30 rounded-xl transition-all duration-200 border border-gray-700/30"
                  >
                    <LogOut className="mr-4 w-6 h-6" />
                    <span className="text-lg">Sign Out</span>
                  </button>
                </div>

                {/* Bottom Padding for Safe Scrolling */}
                <div className="h-20"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Desktop Sidebar */}
      <div className={`hidden lg:block fixed top-0 left-0 h-screen ${isCollapsed ? 'w-20' : 'w-56'} bg-gray-900/90 backdrop-blur-lg border-r border-gray-700/40 z-50 transition-all duration-300 ease-in-out`}>
        <div className="h-full flex flex-col">
          {/* Top Section */}
          <div className="flex-1 p-4 overflow-y-auto">
            {/* Logo and App Name */}
            <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-6'} mb-8 px-4`}>
              {!isCollapsed && (
                <span className="text-2xl font-bold font-ordinary" style={{ color: '#5651e9' }}>StudyFlow</span>
              )}
              <button
                onClick={toggleSidebar}
                className={`flex items-center p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors ${isCollapsed ? 'justify-center w-full' : ''}`}
              >
                {isCollapsed ? (
                  <ChevronRight className="w-5 h-5" />
                ) : (
                  <ChevronLeft className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* Navigation Items */}
            <nav className="space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => navigate('/' + item.id)}
                  className={`flex items-center w-full ${isCollapsed ? 'justify-center px-0' : 'px-4'} py-3 rounded-lg text-base font-medium transition-colors 
                    ${location.pathname.substring(1) === item.id
                      ? 'bg-primary-700/30 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800'
                    }`}
                >
                  <item.icon className={`${isCollapsed ? 'mr-0' : 'mr-3'} flex-shrink-0 w-5 h-5`} />
                  {!isCollapsed && item.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Bottom Section - User and Sign Out - Fixed at bottom */}
          <div className="flex-shrink-0 border-t border-gray-700/40">
            {/* User Info and Sign Out Button for Uncollapsed State */}
            {user && !isCollapsed && (
              <div className="p-4 space-y-2">
                <div className="flex items-center space-x-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700/30">
                  <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {user.email ? user.email[0].toUpperCase() : 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium text-sm">Signed in as</p>
                    <p className="text-gray-400 truncate text-xs">{user.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => signOut()}
                  className="flex items-center w-full p-3 text-gray-400 hover:text-white hover:bg-red-900/30 hover:border-red-700/30 rounded-lg transition-all duration-200 border border-gray-700/30"
                >
                  <LogOut className="w-5 h-5 mr-3" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}

            {/* User Avatar for Collapsed State - Acts as a Sign Out Button */}
            {user && isCollapsed && (
              <div className="p-4 flex justify-center">
                <button
                  onClick={() => signOut()}
                  title={`Sign out ${user.email}`}
                  className="w-10 h-10 bg-primary-500 hover:bg-primary-600 transition-colors rounded-full flex items-center justify-center text-white font-bold text-sm"
                >
                  {user.email ? user.email[0].toUpperCase() : 'U'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
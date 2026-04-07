import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Briefcase, 
  DollarSign,
  FolderKanban,
  BookOpen,
  Music,
  Languages,
  MessageSquare,
  Clock,
  Menu,
  X
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { id: 'personal-tasks', label: 'Personal Tasks', icon: CheckSquare, path: '/personal-tasks' },
    { id: 'work-tasks', label: 'Work Tasks', icon: Briefcase, path: '/work-tasks' },
    { id: 'budget', label: 'Budget & Savings', icon: DollarSign, path: '/budget' },
    { id: 'projects', label: 'Projects', icon: FolderKanban, path: '/projects' },
    { id: 'music', label: 'Music', icon: Music, path: '/music' },
    { id: 'library', label: 'Book Library', icon: BookOpen, path: '/books' },
    // { id: 'language', label: 'Language Learning', icon: Languages, path: '/language' },
    // { id: 'ai-chat', label: 'AI Chat', icon: MessageSquare, path: '/ai-chat' },
    { id: 'focus', label: 'Focus Timer', icon: Clock, path: '/focus' },
  ];

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className={`h-screen bg-white dark:bg-gray-800  flex flex-col transition-all duration-300 ${
      isCollapsed ? 'w-20' : 'w-64'
    }`}>
      {/* Logo and Toggle */}
      <div className="p-6 flex items-center justify-between">
        {!isCollapsed ? (
          <>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Widmaer OS</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">DCW Digital Life</p>
            </div>
            <button
              onClick={() => setIsCollapsed(true)}
              className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Collapse sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </>
        ) : (
          <button
            onClick={() => setIsCollapsed(false)}
            className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors mx-auto"
            title="Expand sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <li key={item.id}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    active
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  } ${isCollapsed ? 'justify-center' : ''}`}
                  title={isCollapsed ? item.label : ''}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {!isCollapsed && <span className="font-medium">{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
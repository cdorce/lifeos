import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut } from 'lucide-react';
import toast from 'react-hot-toast';

const Header = () => {
  const { user, logout } = useAuth();
  const [currentDate, setCurrentDate] = useState('');
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    // Set current date
    const today = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    setCurrentDate(today.toLocaleDateString('en-US', options));

    // Update time every second
    const updateTime = () => {
      const now = new Date();
      const timeString = now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit',
        hour12: true 
      });
      setCurrentTime(timeString);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between shadow-sm">
      {/* Left: Current Date */}
      <div>
        <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
          {currentDate}
        </p>
      </div>

      {/* Right: Time & Logout */}
      <div className="flex items-center gap-6">
        <div className="text-right">
          <p className="text-gray-900 dark:text-white font-medium text-lg">
            {currentTime}
          </p>
        </div>
        
        {user && (
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
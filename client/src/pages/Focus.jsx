import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Plus, Clock, TrendingUp, Calendar, CheckCircle, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import focusService from '../services/focusService';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const Focus = () => {
  const [sessions, setSessions] = useState([]);
  const [stats, setStats] = useState({
    totalSessions: 0,
    completedSessions: 0,
    totalMinutes: 0,
    todaySessions: 0,
    todayMinutes: 0,
    avgDuration: 0
  });
  const [loading, setLoading] = useState(true);
  
  // Timer state
  const [timerType, setTimerType] = useState('pomodoro'); // pomodoro, short, long, custom
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [currentSession, setCurrentSession] = useState(null);
  const [customMinutes, setCustomMinutes] = useState(25);
  
  const intervalRef = useRef(null);
  const audioRef = useRef(null);

  // Timer durations
  const timerDurations = {
    pomodoro: 25 * 60,
    short: 5 * 60,
    long: 15 * 60,
    custom: customMinutes * 60
  };

  useEffect(() => {
    fetchSessions();
    fetchStats();
  }, []);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const allSessions = await focusService.getAllSessions();
      setSessions(allSessions);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      toast.error('Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const sessionStats = await focusService.getSessionStats();
      setStats(sessionStats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleStart = async () => {
    if (!isRunning && !currentSession) {
      // Create a new session
      const sessionData = {
        type: timerType,
        duration: Math.ceil(timerDurations[timerType] / 60),
        start_time: new Date().toISOString(),
        completed: false
      };

      try {
        const newSession = await focusService.createSession(sessionData);
        setCurrentSession(newSession);
        setIsRunning(true);
        toast.success('Focus session started!');
      } catch (error) {
        console.error('Error starting session:', error);
        toast.error('Failed to start session');
      }
    } else {
      setIsRunning(true);
    }
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = async () => {
    setIsRunning(false);
    setTimeLeft(timerDurations[timerType]);
    
    if (currentSession) {
      // Delete incomplete session
      try {
        await focusService.deleteSession(currentSession.id);
        setCurrentSession(null);
      } catch (error) {
        console.error('Error deleting session:', error);
      }
    }
  };

  const handleTimerComplete = async () => {
    setIsRunning(false);
    
    // Play completion sound
    if (audioRef.current) {
      audioRef.current.play().catch(err => console.log('Audio play failed:', err));
    }

    // Update session as completed
    if (currentSession) {
      try {
        await focusService.updateSession(currentSession.id, {
          completed: true,
          end_time: new Date().toISOString()
        });
        
        toast.success('🎉 Focus session completed!');
        setCurrentSession(null);
        fetchSessions();
        fetchStats();
      } catch (error) {
        console.error('Error completing session:', error);
        toast.error('Failed to save session');
      }
    }
  };

  const handleTimerTypeChange = (type) => {
    if (!isRunning) {
      setTimerType(type);
      setTimeLeft(timerDurations[type]);
    }
  };

  const handleCustomMinutesChange = (minutes) => {
    setCustomMinutes(minutes);
    if (timerType === 'custom' && !isRunning) {
      setTimeLeft(minutes * 60);
    }
  };

  const handleDeleteSession = async (sessionId) => {
    if (!window.confirm('Are you sure you want to delete this session?')) return;

    try {
      await focusService.deleteSession(sessionId);
      toast.success('Session deleted successfully!');
      fetchSessions();
      fetchStats();
    } catch (error) {
      console.error('Error deleting session:', error);
      toast.error('Failed to delete session');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDuration = (minutes) => {
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${hours}h ${mins}m`;
    }
    return `${minutes}m`;
  };

  const getTimerTypeLabel = (type) => {
    switch (type) {
      case 'pomodoro': return 'Pomodoro';
      case 'short': return 'Short Break';
      case 'long': return 'Long Break';
      case 'custom': return 'Custom';
      default: return type;
    }
  };

  const progress = ((timerDurations[timerType] - timeLeft) / timerDurations[timerType]) * 100;

  // Group sessions by date
  const groupedSessions = sessions.reduce((groups, session) => {
    const date = format(new Date(session.start_time), 'yyyy-MM-dd');
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(session);
    return groups;
  }, {});

  const sortedDates = Object.keys(groupedSessions).sort().reverse().slice(0, 7); // Last 7 days

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Audio for completion sound */}
      <audio ref={audioRef} src="https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3" />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Focus Timer</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Stay focused and productive</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          icon={<Clock className="w-6 h-6" />}
          title="Today's Focus"
          value={formatDuration(stats.todayMinutes || 0)}
          color="blue"
        />
        <StatCard
          icon={<CheckCircle className="w-6 h-6" />}
          title="Completed Today"
          value={stats.todaySessions || 0}
          color="green"
        />
        <StatCard
          icon={<TrendingUp className="w-6 h-6" />}
          title="Total Sessions"
          value={stats.totalSessions || 0}
          color="purple"
        />
        <StatCard
          icon={<Calendar className="w-6 h-6" />}
          title="Total Time"
          value={formatDuration(stats.totalMinutes || 0)}
          color="orange"
        />
      </div>

      {/* Timer Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Timer Display */}
        <div className="bg-gradient-to-br from-slate-400 to-blue-400 dark:from-slate-600 dark:to-blue-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold mb-1">{getTimerTypeLabel(timerType)}</h2>
            {currentSession && (
              <p className="text-blue-100 dark:text-blue-200 text-sm">Session in progress...</p>
            )}
          </div>

          {/* Circular Progress - Smaller */}
          <div className="relative w-48 h-48 mx-auto mb-6">
            <svg className="transform -rotate-90 w-48 h-48">
              <circle
                cx="96"
                cy="96"
                r="88"
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="6"
                fill="none"
              />
              <circle
                cx="96"
                cy="96"
                r="88"
                stroke="white"
                strokeWidth="6"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 88}`}
                strokeDashoffset={`${2 * Math.PI * 88 * (1 - progress / 100)}`}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-5xl font-bold mb-1">{formatTime(timeLeft)}</div>
                <div className="text-xs opacity-80">{Math.round(progress)}% complete</div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-3">
            {!isRunning ? (
              <button
                onClick={handleStart}
                className="px-6 py-3 bg-white text-blue-600 rounded-full font-semibold hover:bg-blue-50 transition-all transform hover:scale-105 shadow-md flex items-center gap-2"
              >
                <Play className="w-5 h-5" />
                Start
              </button>
            ) : (
              <button
                onClick={handlePause}
                className="px-6 py-3 bg-white text-blue-600 rounded-full font-semibold hover:bg-blue-50 transition-all transform hover:scale-105 shadow-md flex items-center gap-2"
              >
                <Pause className="w-5 h-5" />
                Pause
              </button>
            )}
            <button
              onClick={handleReset}
              className="px-5 py-3 bg-white/20 backdrop-blur-sm text-white rounded-full font-semibold hover:bg-white/30 transition-all flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
          </div>
        </div>

        {/* Timer Settings */}
        <div className="space-y-6">
          {/* Timer Type Selection */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Timer Type</h3>
            <div className="grid grid-cols-2 gap-3">
              <TimerTypeButton
                label="Pomodoro"
                duration="25 min"
                active={timerType === 'pomodoro'}
                disabled={isRunning}
                onClick={() => handleTimerTypeChange('pomodoro')}
              />
              <TimerTypeButton
                label="Short Break"
                duration="5 min"
                active={timerType === 'short'}
                disabled={isRunning}
                onClick={() => handleTimerTypeChange('short')}
              />
              <TimerTypeButton
                label="Long Break"
                duration="15 min"
                active={timerType === 'long'}
                disabled={isRunning}
                onClick={() => handleTimerTypeChange('long')}
              />
              <TimerTypeButton
                label="Custom"
                duration={`${customMinutes} min`}
                active={timerType === 'custom'}
                disabled={isRunning}
                onClick={() => handleTimerTypeChange('custom')}
              />
            </div>

            {/* Custom Minutes Input */}
            {timerType === 'custom' && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Custom Duration (minutes)
                </label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={customMinutes}
                  onChange={(e) => handleCustomMinutesChange(parseInt(e.target.value) || 0)}
                  disabled={isRunning}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white disabled:opacity-50"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Session History */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Recent Sessions</h2>
        
        {sortedDates.length > 0 ? (
          <div className="space-y-4">
            {sortedDates.map(date => (
              <div key={date}>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  {format(new Date(date), 'EEEE, MMMM dd, yyyy')}
                </h3>
                <div className="space-y-2">
                  {groupedSessions[date].map(session => (
                    <SessionCard
                      key={session.id}
                      session={session}
                      onDelete={handleDeleteSession}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">No sessions yet</p>
            <p className="text-sm text-gray-400 dark:text-gray-500">Start your first focus session above!</p>
          </div>
        )}
      </div>
    </div>
  );
};

// StatCard Component
const StatCard = ({ icon, title, value, color }) => {
  let colorClass = '';
  
  switch(color) {
    case 'blue':
      colorClass = 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400';
      break;
    case 'green':
      colorClass = 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400';
      break;
    case 'purple':
      colorClass = 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400';
      break;
    case 'orange':
      colorClass = 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400';
      break;
    default:
      colorClass = 'bg-gray-50 dark:bg-gray-900/20 text-gray-600 dark:text-gray-400';
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl p-4 ${colorClass}`}>
      <div className="flex items-center gap-3 mb-2">
        {icon}
        <p className="text-sm font-medium">{title}</p>
      </div>
      <p className={`text-2xl font-bold ${
        color === 'blue' ? 'text-blue-900 dark:text-blue-300' :
        color === 'green' ? 'text-green-900 dark:text-green-300' :
        color === 'purple' ? 'text-purple-900 dark:text-purple-300' :
        color === 'orange' ? 'text-orange-900 dark:text-orange-300' :
        'text-gray-900 dark:text-white'
      }`}>
        {value}
      </p>
    </div>
  );
};

// TimerTypeButton Component
const TimerTypeButton = ({ label, duration, active, disabled, onClick }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`p-4 rounded-lg border-2 transition-all ${
        active
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
          : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-blue-300 dark:hover:border-blue-600'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <div className="font-semibold">{label}</div>
      <div className="text-sm opacity-75">{duration}</div>
    </button>
  );
};

// SessionCard Component
const SessionCard = ({ session, onDelete }) => {
  const [showMenu, setShowMenu] = useState(false);

  const getTypeColor = (type) => {
    switch (type) {
      case 'pomodoro': return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400';
      case 'short': return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
      case 'long': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400';
      case 'custom': return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400';
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
      <div className="flex items-center gap-4">
        <div className={`p-2 rounded-lg ${session.completed ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-200 dark:bg-gray-600'}`}>
          {session.completed ? (
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
          ) : (
            <Clock className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          )}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(session.type)}`}>
              {session.type}
            </span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {session.duration} minutes
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {format(new Date(session.start_time), 'h:mm a')}
            {session.completed && ' - Completed'}
          </p>
        </div>
      </div>

      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
        >
          <MoreVertical className="w-5 h-5" />
        </button>

        {showMenu && (
          <div className="absolute right-0 mt-1 w-32 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-1 z-10 border border-gray-200 dark:border-gray-700">
            <button
              onClick={() => {
                onDelete(session.id);
                setShowMenu(false);
              }}
              className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Focus;
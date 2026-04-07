import React from 'react';
import { Flame, Calendar, ChevronRight } from 'lucide-react';

const LanguageCard = ({ language, progress, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm hover:shadow-lg transition-all cursor-pointer border border-gray-200 dark:border-gray-700"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="text-5xl">{language.flag || '🌍'}</div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{language.name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{language.native_name}</p>
          </div>
        </div>
        <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-sm font-medium rounded-full">
          {language.level}
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="flex items-center gap-2 text-sm">
          <Flame className="w-4 h-4 text-orange-500" />
          <span className="text-gray-700 dark:text-gray-300">{language.streak || 0} day streak</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="w-4 h-4 text-blue-500" />
          <span className="text-gray-700 dark:text-gray-300">Week {language.current_week}/{language.target_weeks || 12}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-1">
          <span className="text-gray-600 dark:text-gray-400">Progress</span>
          <span className="font-semibold text-gray-900 dark:text-white">{progress}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Continue Button */}
      <button className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2">
        Continue Learning
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};

export default LanguageCard;
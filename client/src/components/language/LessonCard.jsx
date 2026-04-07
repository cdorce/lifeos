import React from 'react';
import { Check, Lock, ChevronRight } from 'lucide-react';

const LessonCard = ({ lesson, language, onClick }) => {
  const isLocked = lesson.week > language.current_week || 
                   (lesson.week === language.current_week && lesson.day > language.current_day);
  const isCompleted = lesson.completed;

  const getTypeIcon = (type) => {
    switch (type) {
      case 'vocabulary': return '📚';
      case 'grammar': return '✍️';
      case 'speaking': return '🗣️';
      case 'listening': return '👂';
      case 'reading': return '📖';
      case 'writing': return '📝';
      case 'video': return '🎥';
      case 'pdf': return '📄';
      default: return '📌';
    }
  };

  return (
    <div 
      onClick={() => !isLocked && onClick()}
      className={`flex items-center justify-between p-4 rounded-lg border ${
        isLocked 
          ? 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 cursor-not-allowed' 
          : isCompleted
          ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 cursor-pointer hover:shadow-md'
          : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-600 cursor-pointer hover:shadow-md'
      } transition-all`}
    >
      <div className="flex items-center gap-3">
        <div className="text-2xl">{getTypeIcon(lesson.type)}</div>
        <div>
          <h5 className="font-semibold text-gray-900 dark:text-white">{lesson.title}</h5>
          <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{lesson.type}</p>
        </div>
      </div>
      
      <div>
        {isLocked ? (
          <Lock className="w-5 h-5 text-gray-400" />
        ) : isCompleted ? (
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
            {lesson.score && (
              <span className="text-sm font-semibold text-green-600 dark:text-green-400">{lesson.score}%</span>
            )}
          </div>
        ) : (
          <ChevronRight className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        )}
      </div>
    </div>
  );
};

export default LessonCard;
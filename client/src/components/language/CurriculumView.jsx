import React from 'react';
import { Flame, Calendar, Award, BookOpen } from 'lucide-react';
import LessonCard from './LessonCard';

const CurriculumView = ({ language, curriculum, onLessonClick }) => {
  // Group curriculum by week
  const curriculumByWeek = curriculum.reduce((acc, item) => {
    if (!acc[item.week]) {
      acc[item.week] = {};
    }
    if (!acc[item.week][item.day]) {
      acc[item.week][item.day] = [];
    }
    acc[item.week][item.day].push(item);
    return acc;
  }, {});

  const weeks = Object.keys(curriculumByWeek).sort((a, b) => a - b);

  return (
    <div className="space-y-6">
      {/* Language Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-4 mb-4">
          <div className="text-6xl">{language.flag || '🌍'}</div>
          <div>
            <h2 className="text-3xl font-bold">{language.name}</h2>
            <p className="text-blue-100">{language.native_name}</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5" />
            <div>
              <p className="text-sm opacity-80">Streak</p>
              <p className="font-bold">{language.streak || 0} days</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            <div>
              <p className="text-sm opacity-80">Current Week</p>
              <p className="font-bold">Week {language.current_week}/{language.target_weeks || 12}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            <div>
              <p className="text-sm opacity-80">Level</p>
              <p className="font-bold">{language.level}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Curriculum */}
      {curriculum.length > 0 ? (
        <div className="space-y-6">
          {weeks.map(week => (
            <div key={week} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Week {week}</h3>
              
              <div className="space-y-4">
                {Object.keys(curriculumByWeek[week]).sort((a, b) => a - b).map(day => (
                  <div key={day}>
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Day {day}</h4>
                    <div className="space-y-2">
                      {curriculumByWeek[week][day].map(item => (
                        <LessonCard 
                          key={item.id} 
                          lesson={item} 
                          language={language}
                          onClick={() => onLessonClick(item)}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400 text-lg">No curriculum available yet</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">Click "Add Lesson" to start building your curriculum!</p>
        </div>
      )}
    </div>
  );
};

export default CurriculumView;
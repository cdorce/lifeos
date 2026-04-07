import React, { useState, useEffect } from 'react';
import { Languages, Plus } from 'lucide-react';
import languageService from '../services/languageService';
import toast from 'react-hot-toast';

// Import components
import LanguageCard from '../components/language/LanguageCard';
import CurriculumView from '../components/language/CurriculumView';
import LessonModal from '../components/language/LessonModal';
import AddLessonModal from '../components/language/AddLessonModal';
import AddLanguageModal from '../components/language/AddLanguageModal';

const Language = () => {
  const [languages, setLanguages] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [curriculum, setCurriculum] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [showCurriculum, setShowCurriculum] = useState(false);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddLessonModal, setShowAddLessonModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLanguages();
  }, []);

  const fetchLanguages = async () => {
    try {
      setLoading(true);
      const allLanguages = await languageService.getAllLanguages();
      setLanguages(allLanguages);
    } catch (error) {
      console.error('Error fetching languages:', error);
      toast.error('Failed to load languages');
    } finally {
      setLoading(false);
    }
  };

  const fetchCurriculum = async (languageId) => {
    try {
      const curriculumData = await languageService.getCurriculum(languageId);
      setCurriculum(curriculumData);
    } catch (error) {
      console.error('Error fetching curriculum:', error);
      toast.error('Failed to load curriculum');
    }
  };

  const handleAddLanguage = async (languageData) => {
    try {
      await languageService.createLanguage(languageData);
      toast.success('Language added successfully!');
      setShowAddModal(false);
      fetchLanguages();
    } catch (error) {
      console.error('Error adding language:', error);
      toast.error('Failed to add language');
    }
  };

  const handleAddLesson = async (lessonData) => {
    try {
      await languageService.createCurriculumItem({
        ...lessonData,
        language_id: selectedLanguage.id
      });
      toast.success('Lesson added successfully!');
      setShowAddLessonModal(false);
      fetchCurriculum(selectedLanguage.id);
    } catch (error) {
      console.error('Error adding lesson:', error);
      toast.error('Failed to add lesson');
    }
  };

  const handleLanguageClick = async (language) => {
    setSelectedLanguage(language);
    setShowCurriculum(true);
    await fetchCurriculum(language.id);
  };

  const handleBackToLanguages = () => {
    setShowCurriculum(false);
    setSelectedLanguage(null);
    setCurriculum([]);
  };

  const handleLessonClick = (lesson) => {
    setSelectedLesson(lesson);
    setShowLessonModal(true);
  };

  const handleCompleteLesson = async () => {
    try {
      await languageService.completeLesson(selectedLesson.id, {
        language_id: selectedLanguage.id,
        score: 100
      });
      toast.success('Lesson completed! 🎉');
      setShowLessonModal(false);
      fetchCurriculum(selectedLanguage.id);
    } catch (error) {
      console.error('Error completing lesson:', error);
      toast.error('Failed to complete lesson');
    }
  };

  const calculateProgress = (language) => {
    const totalWeeks = language.target_weeks || 12;
    const currentWeek = language.current_week || 1;
    return Math.round((currentWeek / totalWeeks) * 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {!showCurriculum ? (
        <>
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Language Learning</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Master new languages with structured curriculum</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Language
            </button>
          </div>

          {/* Language Cards Grid */}
          {languages.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {languages.map(lang => (
                <LanguageCard 
                  key={lang.id} 
                  language={lang}
                  progress={calculateProgress(lang)}
                  onClick={() => handleLanguageClick(lang)}
                />
              ))}
              
              {/* Add New Language Card */}
              <div
                onClick={() => setShowAddModal(true)}
                className="bg-white dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 p-6 flex flex-col items-center justify-center hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer transition-all min-h-[300px]"
              >
                <Languages className="w-12 h-12 text-gray-400 mb-3" />
                <p className="text-gray-600 dark:text-gray-400 font-medium">Add New Language</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Languages className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">No languages yet</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Your First Language
              </button>
            </div>
          )}
        </>
      ) : (
        <>
          {/* Back Button */}
          <button
            onClick={handleBackToLanguages}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium flex items-center gap-2"
          >
            ← Back to Languages
          </button>

          {/* Add Lesson Button */}
          <div className="flex justify-end">
            <button
              onClick={() => setShowAddLessonModal(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Lesson
            </button>
          </div>

          {/* Curriculum View */}
          <CurriculumView 
            language={selectedLanguage} 
            curriculum={curriculum}
            onLessonClick={handleLessonClick}
          />
        </>
      )}

      {/* Modals */}
      {showAddModal && (
        <AddLanguageModal
          onClose={() => setShowAddModal(false)}
          onSave={handleAddLanguage}
        />
      )}

      {showAddLessonModal && (
        <AddLessonModal
          onClose={() => setShowAddLessonModal(false)}
          onSave={handleAddLesson}
        />
      )}

      {showLessonModal && selectedLesson && (
        <LessonModal
          lesson={selectedLesson}
          language={selectedLanguage}
          onClose={() => setShowLessonModal(false)}
          onComplete={handleCompleteLesson}
        />
      )}
    </div>
  );
};

export default Language;
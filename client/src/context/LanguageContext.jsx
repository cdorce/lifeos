import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const LanguageContext = createContext(null);

export const LanguageProvider = ({ children }) => {
  const [languages, setLanguages] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [curriculum, setCurriculum] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch user's languages
  const fetchLanguages = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/language/languages`,
        { headers: { Authorization: `Bearer ${token}` }}
      );
      setLanguages(response.data);
    } catch (error) {
      console.error('Failed to fetch languages:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch curriculum for a language
  const fetchCurriculum = async (languageId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/language/${languageId}/curriculum`,
        { headers: { Authorization: `Bearer ${token}` }}
      );
      setCurriculum(response.data);
    } catch (error) {
      console.error('Failed to fetch curriculum:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mark lesson as complete
  const markLessonComplete = async (lessonId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/language/lesson/${lessonId}/complete`,
        {},
        { headers: { Authorization: `Bearer ${token}` }}
      );
      // Refresh curriculum to get updated progress
      if (selectedLanguage) {
        fetchCurriculum(selectedLanguage.id);
      }
    } catch (error) {
      console.error('Failed to mark lesson complete:', error);
    }
  };

  // Add new language
  const addLanguage = async (languageData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/language/languages`,
        languageData,
        { headers: { Authorization: `Bearer ${token}` }}
      );
      setLanguages([...languages, response.data]);
      return { success: true, language: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message };
    }
  };

  useEffect(() => {
    fetchLanguages();
  }, []);

  const value = {
    languages,
    selectedLanguage,
    setSelectedLanguage,
    curriculum,
    loading,
    fetchLanguages,
    fetchCurriculum,
    markLessonComplete,
    addLanguage
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
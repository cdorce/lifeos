import React, { useState } from 'react';

const AddLanguageModal = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    native_name: '',
    flag: '',
    level: 'Beginner',
    target_weeks: 12
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const popularLanguages = [
    { name: 'Spanish', native: 'Español', flag: '🇪🇸' },
    { name: 'French', native: 'Français', flag: '🇫🇷' },
    { name: 'German', native: 'Deutsch', flag: '🇩🇪' },
    { name: 'Portuguese', native: 'Português', flag: '🇵🇹' },
    { name: 'Italian', native: 'Italiano', flag: '🇮🇹' },
    { name: 'Japanese', native: '日本語', flag: '🇯🇵' },
    { name: 'Korean', native: '한국어', flag: '🇰🇷' },
    { name: 'Chinese', native: '中文', flag: '🇨🇳' },
  ];

  const selectLanguage = (lang) => {
    setFormData({
      ...formData,
      name: lang.name,
      native_name: lang.native,
      flag: lang.flag
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Add New Language</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Popular Languages */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Popular Languages</h3>
          <div className="grid grid-cols-4 gap-2">
            {popularLanguages.map(lang => (
              <button
                key={lang.name}
                type="button"
                onClick={() => selectLanguage(lang)}
                className={`p-3 rounded-lg border-2 transition-all text-center ${
                  formData.name === lang.name
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                    : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
                }`}
              >
                <div className="text-3xl mb-1">{lang.flag}</div>
                <div className="text-xs font-medium text-gray-900 dark:text-white">{lang.name}</div>
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Language Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Language Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
              required
            />
          </div>

          {/* Native Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Native Name *
            </label>
            <input
              type="text"
              value={formData.native_name}
              onChange={(e) => setFormData({ ...formData, native_name: e.target.value })}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
              required
            />
          </div>

          {/* Flag & Level */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Flag Emoji
              </label>
              <input
                type="text"
                value={formData.flag}
                onChange={(e) => setFormData({ ...formData, flag: e.target.value })}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                placeholder="🌍"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Starting Level
              </label>
              <select
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
          </div>

          {/* Target Weeks */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Target Duration (weeks)
            </label>
            <input
              type="number"
              min="1"
              max="52"
              value={formData.target_weeks}
              onChange={(e) => setFormData({ ...formData, target_weeks: parseInt(e.target.value) })}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Add Language
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddLanguageModal;
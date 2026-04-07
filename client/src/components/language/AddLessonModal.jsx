import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';

const AddLessonModal = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({
    week: 1,
    day: 1,
    title: '',
    type: 'vocabulary',
    description: '',
    video_url: '',
    pdf_url: '',
    links: [],
    words: [],
    notes: ''
  });

  const [newLink, setNewLink] = useState({ title: '', url: '' });
  const [newWord, setNewWord] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Build content object
    const content = {
      description: formData.description,
      video_url: formData.video_url,
      pdf_url: formData.pdf_url,
      links: formData.links,
      words: formData.words,
      notes: formData.notes
    };

    onSave({
      week: formData.week,
      day: formData.day,
      title: formData.title,
      type: formData.type,
      content: content
    });
  };

  const addLink = () => {
    if (newLink.url) {
      setFormData({
        ...formData,
        links: [...formData.links, newLink]
      });
      setNewLink({ title: '', url: '' });
    }
  };

  const addWord = () => {
    if (newWord.trim()) {
      setFormData({
        ...formData,
        words: [...formData.words, newWord.trim()]
      });
      setNewWord('');
    }
  };

  const removeLink = (index) => {
    setFormData({
      ...formData,
      links: formData.links.filter((_, i) => i !== index)
    });
  };

  const removeWord = (index) => {
    setFormData({
      ...formData,
      words: formData.words.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Add New Lesson</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Week & Day */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Week *
              </label>
              <input
                type="number"
                min="1"
                value={formData.week}
                onChange={(e) => setFormData({ ...formData, week: parseInt(e.target.value) })}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Day *
              </label>
              <input
                type="number"
                min="1"
                max="7"
                value={formData.day}
                onChange={(e) => setFormData({ ...formData, day: parseInt(e.target.value) })}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                required
              />
            </div>
          </div>

          {/* Title & Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Lesson Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Lesson Type *
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
            >
              <option value="vocabulary">Vocabulary</option>
              <option value="grammar">Grammar</option>
              <option value="speaking">Speaking</option>
              <option value="listening">Listening</option>
              <option value="reading">Reading</option>
              <option value="writing">Writing</option>
              <option value="video">Video</option>
              <option value="pdf">PDF</option>
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows="3"
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
            />
          </div>

          {/* Video URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Video URL (YouTube or direct link)
            </label>
            <input
              type="url"
              value={formData.video_url}
              onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
              placeholder="https://youtube.com/watch?v=..."
            />
          </div>

          {/* PDF URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              PDF URL
            </label>
            <input
              type="url"
              value={formData.pdf_url}
              onChange={(e) => setFormData({ ...formData, pdf_url: e.target.value })}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
              placeholder="https://example.com/lesson.pdf"
            />
          </div>

          {/* Additional Links */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Additional Resources
            </label>
            <div className="space-y-2">
              {formData.links.map((link, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700 rounded">
                  <span className="flex-1 text-sm text-gray-700 dark:text-gray-300">{link.title || link.url}</span>
                  <button
                    type="button"
                    onClick={() => removeLink(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newLink.title}
                  onChange={(e) => setNewLink({ ...newLink, title: e.target.value })}
                  placeholder="Link title"
                  className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white"
                />
                <input
                  type="url"
                  value={newLink.url}
                  onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                  placeholder="URL"
                  className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white"
                />
                <button
                  type="button"
                  onClick={addLink}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Vocabulary Words */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Vocabulary Words
            </label>
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {formData.words.map((word, index) => (
                  <span key={index} className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-sm flex items-center gap-2">
                    {word}
                    <button
                      type="button"
                      onClick={() => removeWord(index)}
                      className="hover:text-blue-900 dark:hover:text-blue-200"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newWord}
                  onChange={(e) => setNewWord(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addWord())}
                  placeholder="Add vocabulary word"
                  className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white"
                />
                <button
                  type="button"
                  onClick={addWord}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows="3"
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
              placeholder="Additional notes or instructions..."
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
              Add Lesson
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddLessonModal;
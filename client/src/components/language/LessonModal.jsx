import React, { useState, useEffect } from 'react';
import { X, Video, FileText, Headphones, BookOpen, ExternalLink, Check } from 'lucide-react';

const LessonModal = ({ lesson, language, onClose, onComplete }) => {
  const [content, setContent] = useState({});

  useEffect(() => {
    // Parse JSON content
    try {
      const parsed = typeof lesson.content === 'string' ? JSON.parse(lesson.content) : lesson.content;
      setContent(parsed || {});
    } catch (error) {
      console.error('Error parsing lesson content:', error);
      setContent({});
    }
  }, [lesson]);

  const getTypeIcon = (type) => {
    switch (type) {
      case 'video': return <Video className="w-6 h-6" />;
      case 'pdf': return <FileText className="w-6 h-6" />;
      case 'listening': return <Headphones className="w-6 h-6" />;
      default: return <BookOpen className="w-6 h-6" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-t-2xl">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              {getTypeIcon(lesson.type)}
              <div>
                <h2 className="text-2xl font-bold">{lesson.title}</h2>
                <p className="text-blue-100 capitalize">{lesson.type} • Week {lesson.week}, Day {lesson.day}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Description */}
          {content.description && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Description</h3>
              <p className="text-gray-700 dark:text-gray-300">{content.description}</p>
            </div>
          )}

          {/* Video */}
          {content.video_url && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <Video className="w-5 h-5" />
                Video Lesson
              </h3>
              <div className="aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                {content.video_url.includes('youtube.com') || content.video_url.includes('youtu.be') ? (
                  <iframe
                    className="w-full h-full"
                    src={content.video_url.replace('watch?v=', 'embed/')}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video className="w-full h-full" controls>
                    <source src={content.video_url} />
                  </video>
                )}
              </div>
            </div>
          )}

          {/* PDF */}
          {content.pdf_url && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                PDF Resource
              </h3>
              <a
                href={content.pdf_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
              >
                <FileText className="w-5 h-5" />
                <span className="font-medium">Open PDF</span>
                <ExternalLink className="w-4 h-4 ml-auto" />
              </a>
            </div>
          )}

          {/* Links */}
          {content.links && content.links.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Additional Resources</h3>
              <div className="space-y-2">
                {content.links.map((link, index) => (
                  <a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-700 dark:text-gray-300">{link.title || link.url}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Vocabulary */}
          {content.words && content.words.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Vocabulary</h3>
              <div className="grid grid-cols-2 gap-3">
                {content.words.map((word, index) => (
                  <div key={index} className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="font-semibold text-gray-900 dark:text-white">{word}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {content.notes && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Notes</h3>
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{content.notes}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-700 p-6 rounded-b-2xl border-t border-gray-200 dark:border-gray-600">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-500 transition-colors font-medium"
            >
              Close
            </button>
            {!lesson.completed && (
              <button
                onClick={onComplete}
                className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2"
              >
                <Check className="w-5 h-5" />
                Mark as Complete
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonModal;
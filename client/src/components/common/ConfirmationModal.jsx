import React from 'react';
import { AlertCircle, CheckCircle, XCircle, X } from 'lucide-react';

const ConfirmationModal = ({ isOpen, type, title, message, onConfirm, onCancel, loading = false }) => {
  if (!isOpen) return null;

  // Icon based on type
  const getIcon = () => {
    switch (type) {
      case 'delete':
        return <AlertCircle className="w-12 h-12 text-red-500" />;
      case 'success':
        return <CheckCircle className="w-12 h-12 text-green-500" />;
      case 'error':
        return <XCircle className="w-12 h-12 text-red-500" />;
      default:
        return <AlertCircle className="w-12 h-12 text-blue-500" />;
    }
  };

  // Background color based on type
  const getBgColor = () => {
    switch (type) {
      case 'delete':
        return 'bg-gray-300 border-red-700/30';
      case 'success':
        return 'bg-green-900/10 border-green-700/30';
      case 'error':
        return 'bg-red-900/10 border-red-700/30';
      default:
        return 'bg-blue-900/10 border-blue-700/30';
    }
  };

  // Button colors
  const getButtonColor = () => {
    switch (type) {
      case 'delete':
        return 'bg-red-600 hover:bg-red-700';
      case 'success':
        return 'bg-green-600 hover:bg-green-700';
      case 'error':
        return 'bg-red-600 hover:bg-red-700';
      default:
        return 'bg-blue-600 hover:bg-blue-700';
    }
  };

  // For success/error, only show close button
  const isInfoOnly = type === 'success' || type === 'error';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className={`bg-gray-900 rounded-lg border ${getBgColor()} p-6 max-w-sm w-full transform transition-all`}>
        {/* Close button */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon and Content */}
        <div className="flex flex-col items-center text-center">
          <div className="mb-4">
            {getIcon()}
          </div>

          <h3 className="text-lg font-bold text-white mb-2">
            {title}
          </h3>

          <p className="text-gray-300 text-sm mb-6">
            {message}
          </p>

          {/* Buttons */}
          <div className="flex gap-3 w-full">
            {!isInfoOnly && (
              <button
                onClick={onCancel}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded font-medium transition disabled:opacity-50"
              >
                Cancel
              </button>
            )}

            <button
              onClick={onConfirm}
              disabled={loading}
              className={`flex-1 px-4 py-2 ${getButtonColor()} text-white rounded font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
            >
              {loading && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              {isInfoOnly ? 'Close' : type === 'delete' ? 'Delete' : 'Confirm'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
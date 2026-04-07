import React from 'react';
import { X } from 'lucide-react';
import MusicUpload from './MusicUpload';

const MusicUploadModal = ({ isOpen, onClose, userId, defaultAlbum, onUploadSuccess }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto border border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">Upload to {defaultAlbum}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-300 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <MusicUpload 
            userId={userId}
            defaultAlbum={defaultAlbum}
            onUploadSuccess={() => {
              if (onUploadSuccess) {
                onUploadSuccess();
              }
              onClose();
            }} 
          />
        </div>
      </div>
    </div>
  );
};

export default MusicUploadModal;
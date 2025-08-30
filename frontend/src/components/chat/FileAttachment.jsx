import React from 'react';
import { File, Image, Download, Eye } from 'lucide-react';

export default function FileAttachment({ file, onView, onDownload }) {
  const isImage = file.type && file.type.startsWith('image/');
  
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="border rounded-lg p-3 bg-gray-50 max-w-xs">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          {isImage ? (
            <Image className="w-8 h-8 text-blue-500" />
          ) : (
            <File className="w-8 h-8 text-gray-500" />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {file.name}
          </p>
          <p className="text-xs text-gray-500">
            {file.size ? formatFileSize(file.size) : 'Unknown size'}
          </p>
        </div>
        
        <div className="flex space-x-1">
          {isImage && (
            <button
              onClick={() => onView && onView(file)}
              className="p-1 hover:bg-gray-200 rounded"
              title="View image"
            >
              <Eye className="w-4 h-4 text-gray-600" />
            </button>
          )}
          <button
            onClick={() => onDownload && onDownload(file)}
            className="p-1 hover:bg-gray-200 rounded"
            title="Download file"
          >
            <Download className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>
      
      {isImage && file.url && (
        <div className="mt-2">
          <img
            src={file.url}
            alt={file.name}
            className="max-w-full h-auto rounded border"
            style={{ maxHeight: '200px' }}
          />
        </div>
      )}
    </div>
  );
}

import React from 'react';
import UserAvatar from '../user/UserAvatar';
import FileAttachment from './FileAttachment';

export default function MessageItem({ message }) {
  return (
    <div className={`flex items-start space-x-3 ${message.isOwn ? 'flex-row-reverse space-x-reverse' : ''}`}>
      <UserAvatar
        src={message.sender.avatar}
        alt={message.sender.name}
        size="sm"
      />
      
      <div className={`flex flex-col ${message.isOwn ? 'items-end' : 'items-start'}`}>
        <div
          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
            message.isOwn
              ? 'bg-blue-600 text-white rounded-br-sm'
              : 'bg-gray-200 text-gray-900 rounded-bl-sm'
          }`}
        >
          {/* File attachment */}
          {message.file && (
            <div className="mb-2">
              <FileAttachment
                file={message.file}
                onView={(file) => window.open(file.url, '_blank')}
                onDownload={(file) => {
                  const link = document.createElement('a');
                  link.href = file.url;
                  link.download = file.name;
                  link.click();
                }}
              />
            </div>
          )}
          
          {/* Image attachment */}
          {message.image && !message.file && (
            <div className="mb-2">
              <img
                src={message.image}
                alt="Shared image"
                className="max-w-full h-auto rounded border"
                style={{ maxHeight: '200px' }}
              />
            </div>
          )}
          
          {/* Text content */}
          {message.content && (
            <p className="text-sm">{message.content}</p>
          )}
        </div>
        
        <span className="text-xs text-gray-500 mt-1">
          {message.timestamp}
        </span>
      </div>
    </div>
  );
}
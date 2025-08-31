import React, { useState, useRef } from 'react';
import { Send, Paperclip, Smile, X } from 'lucide-react';
import Button from '../ui/Button';
import FileUpload from '../ui/FileUpload';
import EmojiPicker from 'emoji-picker-react';

export default function MessageInput({ onSendMessage, disabled = false }) {
  const [message, setMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if ((message.trim() || selectedFile) && !disabled) {
      onSendMessage(message, selectedFile);
      setMessage('');
      setSelectedFile(null);
      setShowFileUpload(false);
    }
  };

  const handleFileSelect = (file) => {
    setSelectedFile(file);
    if (file) {
      setShowFileUpload(false);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleEmojiClick = (emojiData) => {
    setMessage(prev => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  const handleKeyDown = (e) => {
    // Common emoji shortcuts
    const emojiShortcuts = {
      ':)': '😊',
      ':D': '😃',
      ':(': '😢',
      ':P': '😛',
      ';)': '😉',
      '<3': '❤️',
      ':o': '😮',
      ':|': '😐'
    };

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
      return;
    }

    // Check for emoji shortcuts
    const currentText = message + e.key;
    for (const [shortcut, emoji] of Object.entries(emojiShortcuts)) {
      if (currentText.endsWith(shortcut)) {
        e.preventDefault();
        setMessage(prev => prev.slice(0, -shortcut.length + 1) + emoji);
        return;
      }
    }
  };

  return (
    <div className="border-t border-gray-200 p-4">
      {/* File Upload Area */}
      {showFileUpload && (
        <div className="mb-4">
          <FileUpload
            onFileSelect={handleFileSelect}
            accept="image/*,.pdf,.doc,.docx,.txt,.zip,.rar"
            maxSize={10 * 1024 * 1024} // 10MB
          />
        </div>
      )}

      {/* Selected File Preview */}
      {selectedFile && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Paperclip className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-blue-800 truncate">
                {selectedFile.name}
              </span>
              <span className="text-xs text-blue-600">
                ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
              </span>
            </div>
            <button
              type="button"
              onClick={removeFile}
              className="p-1 hover:bg-blue-100 rounded"
            >
              <X className="w-4 h-4 text-blue-600" />
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-center space-x-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.pdf,.doc,.docx,.txt,.zip,.rar"
          onChange={(e) => handleFileSelect(e.target.files[0])}
          className="hidden"
        />
        
        <button
          type="button"
          onClick={() => {
            if (selectedFile) {
              removeFile();
            } else {
              fileInputRef.current?.click();
            }
          }}
          className={`p-2 rounded-lg hover:bg-gray-100 transition-colors ${
            selectedFile ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <Paperclip className="w-5 h-5" />
        </button>
        
        <div className="flex-1 relative">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={selectedFile ? "Add a caption..." : "Type a message..."}
            disabled={disabled}
            className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
          />
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 rounded"
          >
            <Smile className="w-5 h-5" />
          </button>
          
          {/* Emoji Picker */}
          {showEmojiPicker && (
            <div className="absolute bottom-full right-0 mb-2 z-50">
              <EmojiPicker
                onEmojiClick={handleEmojiClick}
                width={300}
                height={400}
                previewConfig={{
                  showPreview: false
                }}
              />
            </div>
          )}
        </div>

        <Button
          type="submit"
          disabled={(!message.trim() && !selectedFile) || disabled}
          className="px-4 py-3"
        >
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { X, User, Mail, Lock, Camera } from 'lucide-react';
import Modal from '../ui/Modal';
import FileUpload from '../ui/FileUpload';
import ProfilePictureUploader from './ProfilePictureUploader';
import UsernameEditor from './UsernameEditor';

export default function ProfileSettingsModal({ isOpen, onClose, user, onUpdateProfile }) {
  const [isEditingUsername, setIsEditingUsername] = useState(false);

  const handleUsernameChange = (newUsername) => {
    onUpdateProfile({ name: newUsername });
    setIsEditingUsername(false);
  };

  const handleAvatarUpload = async (file) => {
    if (!file) return;
    
    try {
      // Use FormData for Multer upload
      const formData = new FormData();
      formData.append('file', file);
      
      // Upload to backend using Multer
      const uploadResponse = await fetch('/api/file/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
      
      if (uploadResponse.ok) {
        const result = await uploadResponse.json();
        onUpdateProfile({ avatar: result.url });
      } else {
        console.error('Upload failed');
      }
    } catch (error) {
      console.error('Error uploading profile picture:', error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Profile Settings" size="md">
      <div className="space-y-6">
        <ProfilePictureUploader
          currentAvatar={user.avatar}
          username={user.name}
          onUpload={handleAvatarUpload}
        />
        
        <div className="border-t pt-6">
          {isEditingUsername ? (
            <UsernameEditor
              currentUsername={user.name}
              onSave={handleUsernameChange}
              onCancel={() => setIsEditingUsername(false)}
            />
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-medium text-gray-700">Username</label>
                <p className="text-gray-900">{user.name}</p>
              </div>
              <button
                onClick={() => setIsEditingUsername(true)}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Edit
              </button>
            </div>
          )}
        </div>
        
        <div className="border-t pt-6">
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <p className="text-gray-900">{user.email}</p>
        </div>
      </div>
    </Modal>
  );
}
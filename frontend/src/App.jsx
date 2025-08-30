import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { MessageProvider } from './contexts/MessageContext';
import { SocketProvider } from './contexts/SocketContext';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ChatPage from './pages/ChatPage';

function AppRoutes() {
  const { user, login, signup, updateProfile, loading, initialLoading } = useAuth();

  if (initialLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return (
      <Routes>
        <Route 
          path="/chat" 
          element={<ChatPage currentUser={user} onUpdateProfile={updateProfile} />} 
        />
        <Route path="*" element={<Navigate to="/chat" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route 
        path="/login" 
        element={<LoginPage onLogin={login} loading={loading} />} 
      />
      <Route 
        path="/signup" 
        element={<SignupPage onSignup={signup} loading={loading} />} 
      />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <ToastProvider>
        <AuthProvider>
          <SocketProvider>
            <MessageProvider>
              <div className="h-screen overflow-hidden">
                <AppRoutes />
              </div>
            </MessageProvider>
          </SocketProvider>
        </AuthProvider>
      </ToastProvider>
    </Router>
  );
}

export default App;
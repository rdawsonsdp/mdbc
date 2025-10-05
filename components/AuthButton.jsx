'use client'

import React, { useState } from 'react';
import Image from 'next/image';
import { useAuth } from '../contexts/AuthContext';
import { saveSession, getUserSessions } from '../utils/sessionManager';

const AuthButton = ({ onSessionSaved, onSessionsLoaded }) => {
  const { user, loading, signInWithGoogle, signInWithEmail, signUpWithEmail, signOut } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('signin'); // 'signin' or 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [authError, setAuthError] = useState('');

  const handleGoogleSignIn = async () => {
    try {
      setIsSigningIn(true);
      await signInWithGoogle();
    } catch (error) {
      console.error('Google sign in error:', error);
      alert('Failed to sign in with Google. Please try again.');
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setAuthError('');
    
    try {
      setIsSigningIn(true);
      if (authMode === 'signin') {
        await signInWithEmail(email, password);
      } else {
        await signUpWithEmail(email, password, displayName);
      }
      setShowAuthModal(false);
      setEmail('');
      setPassword('');
      setDisplayName('');
    } catch (error) {
      console.error('Email auth error:', error);
      setAuthError(getErrorMessage(error.code));
    } finally {
      setIsSigningIn(false);
    }
  };

  const getErrorMessage = (errorCode) => {
    switch (errorCode) {
      case 'auth/user-not-found':
        return 'No account found with this email address.';
      case 'auth/wrong-password':
        return 'Incorrect password.';
      case 'auth/email-already-in-use':
        return 'An account with this email already exists.';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      default:
        return 'Authentication failed. Please try again.';
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setSessions([]);
      setShowHistory(false);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const loadSessions = async () => {
    if (!user) return;
    
    try {
      setLoadingSessions(true);
      const userSessions = await getUserSessions(user.uid);
      setSessions(userSessions);
      if (onSessionsLoaded) {
        onSessionsLoaded(userSessions);
      }
    } catch (error) {
      console.error('Error loading sessions:', error);
      alert('Failed to load session history.');
    } finally {
      setLoadingSessions(false);
    }
  };

  const handleShowHistory = () => {
    if (!showHistory) {
      loadSessions();
    }
    setShowHistory(!showHistory);
  };

  const loadSession = (session) => {
    // This will be handled by the parent component
    if (onSessionSaved) {
      onSessionSaved(session);
    }
    setShowHistory(false);
  };

  if (loading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gold-500"></div>
        <span className="text-sm text-gray-600">Loading...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col space-y-2">
        <button
          onClick={handleGoogleSignIn}
          disabled={isSigningIn}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          {isSigningIn ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Signing in...</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>Sign in with Google</span>
            </>
          )}
        </button>
        
        <button
          onClick={() => setShowAuthModal(true)}
          className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
          </svg>
          <span>Sign in with Email</span>
        </button>

        {/* Email Authentication Modal */}
        {showAuthModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">
                  {authMode === 'signin' ? 'Sign In' : 'Sign Up'}
                </h3>
                <button
                  onClick={() => setShowAuthModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {authError && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  {authError}
                </div>
              )}

              <form onSubmit={handleEmailAuth} className="space-y-4">
                {authMode === 'signup' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your full name"
                      required={authMode === 'signup'}
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your email"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your password"
                    required
                    minLength={6}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSigningIn}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 rounded-lg font-medium transition-colors"
                >
                  {isSigningIn ? 'Processing...' : (authMode === 'signin' ? 'Sign In' : 'Sign Up')}
                </button>
              </form>

              <div className="mt-4 text-center">
                <button
                  onClick={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  {authMode === 'signin' 
                    ? "Don't have an account? Sign up" 
                    : "Already have an account? Sign in"
                  }
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="flex items-center space-x-3">
        <Image
          src={user.photoURL || '/default-avatar.png'}
          alt={user.displayName || 'User'}
          width={32}
          height={32}
          className="w-8 h-8 rounded-full"
        />
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-900">
            {user.displayName || 'User'}
          </span>
          <span className="text-xs text-gray-500">{user.email}</span>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleShowHistory}
            className="bg-gold-500 hover:bg-gold-600 text-white px-3 py-1 rounded text-sm transition-colors"
          >
            {showHistory ? 'Hide History' : 'History'}
          </button>
          <button
            onClick={handleSignOut}
            className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* History Panel */}
      {showHistory && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
          <div className="p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Session History</h3>
            {loadingSessions ? (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gold-500"></div>
              </div>
            ) : sessions.length === 0 ? (
              <p className="text-gray-500 text-sm">No saved sessions yet.</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    onClick={() => loadSession(session)}
                    className="p-3 bg-gray-50 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors"
                  >
                    <div className="font-medium text-sm text-gray-900">
                      {session.name}
                    </div>
                    <div className="text-xs text-gray-600">
                      {session.birthMonth} {session.birthDay}, {session.birthYear}
                    </div>
                    <div className="text-xs text-gold-600 font-medium">
                      {session.birthCard}
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(session.createdAt?.seconds * 1000).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthButton;

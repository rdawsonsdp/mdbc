'use client'

import React, { useState } from 'react';
import Image from 'next/image';
import { useAuth } from './auth-context.jsx';

const AuthButton = ({ 
  onSessionSaved, 
  onSessionsLoaded, 
  showHistory = true,
  showEmailAuth = true,
  customStyles = {}
}) => {
  const { user, loading, signInWithGoogle, signInWithEmail, signUpWithEmail, resetPassword, signOut } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [authError, setAuthError] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setIsSigningIn(true);
      console.log('Starting Google sign in...');
      await signInWithGoogle();
      console.log('Google sign in successful');
    } catch (error) {
      console.error('Google sign in error:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      
      let errorMessage = 'Failed to sign in with Google. ';
      
      switch (error.code) {
        case 'auth/popup-closed-by-user':
          errorMessage += 'Sign-in popup was closed. Please try again.';
          break;
        case 'auth/popup-blocked':
          errorMessage += 'Popup was blocked by your browser. Please allow popups and try again.';
          break;
        case 'auth/cancelled-popup-request':
          errorMessage += 'Another sign-in attempt is already in progress.';
          break;
        case 'auth/unauthorized-domain':
          errorMessage += 'This domain is not authorized for Google sign-in.';
          break;
        case 'auth/operation-not-allowed':
          errorMessage += 'Google sign-in is not enabled. Please contact support.';
          break;
        case 'auth/network-request-failed':
          errorMessage += 'Network error. Please check your internet connection.';
          break;
        default:
          errorMessage += `Error: ${error.message}`;
      }
      
      alert(errorMessage);
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

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setAuthError('');
    
    if (!email) {
      setAuthError('Please enter your email address first.');
      return;
    }
    
    try {
      setIsSigningIn(true);
      await resetPassword(email);
      setResetEmailSent(true);
    } catch (error) {
      console.error('Password reset error:', error);
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
      case 'auth/too-many-requests':
        return 'Too many attempts. Please try again later.';
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
          style={customStyles.googleButton}
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
        
        {showEmailAuth && (
          <button
            onClick={() => setShowAuthModal(true)}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            style={customStyles.emailButton}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
            </svg>
            <span>Sign in with Email</span>
          </button>
        )}

        {/* Email Authentication Modal */}
        {showAuthModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">
                  {showForgotPassword ? 'Reset Password' : (authMode === 'signin' ? 'Sign In' : 'Sign Up')}
                </h3>
                <button
                  onClick={() => {
                    setShowAuthModal(false);
                    setShowForgotPassword(false);
                    setResetEmailSent(false);
                    setAuthError('');
                    setEmail('');
                    setPassword('');
                    setDisplayName('');
                  }}
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

              {resetEmailSent ? (
                <div className="text-center">
                  <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                    <p className="font-semibold">Password reset email sent!</p>
                    <p className="text-sm mt-1">Check your email and follow the instructions to reset your password.</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowForgotPassword(false);
                      setResetEmailSent(false);
                      setAuthError('');
                    }}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Back to Sign In
                  </button>
                </div>
              ) : showForgotPassword ? (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your email address"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSigningIn}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 rounded-lg font-medium transition-colors"
                  >
                    {isSigningIn ? 'Sending...' : 'Send Reset Email'}
                  </button>

                  <div className="text-center">
                    <button
                      onClick={() => {
                        setShowForgotPassword(false);
                        setAuthError('');
                      }}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Back to Sign In
                    </button>
                  </div>
                </form>
              ) : (
                <>
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

                    {authMode === 'signin' && (
                      <div className="text-right">
                        <button
                          type="button"
                          onClick={() => setShowForgotPassword(true)}
                          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Forgot your password?
                        </button>
                      </div>
                    )}

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
                </>
              )}
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
          {showHistory && (
            <button
              onClick={handleShowHistory}
              className="bg-gold-500 hover:bg-gold-600 text-white px-3 py-1 rounded text-sm transition-colors"
            >
              {showHistory ? 'Hide History' : 'History'}
            </button>
          )}
          <button
            onClick={handleSignOut}
            className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthButton;

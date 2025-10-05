'use client'

import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { saveSession } from '../utils/sessionManager';

const SaveSessionButton = ({ name, month, day, year, birthCard }) => {
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSaveSession = async () => {
    if (!user) {
      alert('Please sign in to save your session.');
      return;
    }

    if (!name || !month || !day || !year || !birthCard) {
      alert('Please complete your birth information first.');
      return;
    }

    try {
      setIsSaving(true);
      await saveSession(user.uid, {
        name,
        birthMonth: month,
        birthDay: parseInt(day),
        birthYear: parseInt(year),
        birthCard
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000); // Reset after 3 seconds
    } catch (error) {
      console.error('Error saving session:', error);
      alert('Failed to save session. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) {
    return (
      <button
        disabled
        className="bg-gray-300 text-gray-500 px-4 py-2 rounded-lg cursor-not-allowed flex items-center space-x-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        <span>Sign in to save</span>
      </button>
    );
  }

  return (
    <button
      onClick={handleSaveSession}
      disabled={isSaving || saved}
      className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
        saved
          ? 'bg-green-500 text-white cursor-default'
          : isSaving
          ? 'bg-blue-400 text-white cursor-not-allowed'
          : 'bg-gold-500 hover:bg-gold-600 text-white'
      }`}
    >
      {saved ? (
        <>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>Saved!</span>
        </>
      ) : isSaving ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          <span>Saving...</span>
        </>
      ) : (
        <>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <span>Save Session</span>
        </>
      )}
    </button>
  );
};

export default SaveSessionButton;

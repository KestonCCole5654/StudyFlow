import React from 'react';
import YouTubeInputPanel from '../components/QuizHub/YouTubeInputPanel';

export function QuizHubPage() {
  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Quiz Hub: YouTube Transcript</h1>
      <YouTubeInputPanel />
    </div>
  );
}
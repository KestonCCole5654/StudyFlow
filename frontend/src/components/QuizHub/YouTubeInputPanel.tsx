import React, { useState } from 'react';
import { Button } from '../ui/button';
import { FlashcardViewer } from './FlashcardViewer';
import { geminiQuizGenerator } from '../../lib/gemini';

const BACKEND_URL = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3001';

const YouTubeInputPanel: React.FC = () => {
  const [url, setUrl] = useState('');
  const [transcript, setTranscript] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [flashcards, setFlashcards] = useState<any[]>([]);
  const [flashLoading, setFlashLoading] = useState(false);
  const [flashError, setFlashError] = useState('');
  const [showFlashcards, setShowFlashcards] = useState(false);

  const handleGetTranscript = async () => {
    setLoading(true);
    setTranscript('');
    setError('');
    setStatus('');
    try {
      // 1. Start transcription
      const res = await fetch(`${BACKEND_URL}/api/transcribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoUrl: url }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to start transcription');
      const { transcriptId } = data;

      // 2. Poll for status
      let polling = true;
      while (polling) {
        await new Promise(r => setTimeout(r, 2500));
        const statusRes = await fetch(`${BACKEND_URL}/api/transcribe-status?id=${transcriptId}`);
        const statusData = await statusRes.json();
        setStatus(statusData.status);
        if (statusData.status === 'completed') {
          setTranscript(statusData.text);
          polling = false;
        } else if (statusData.status === 'failed' || statusData.status === 'error') {
          throw new Error('Transcription failed');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch transcript');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateFlashcards = async () => {
    setFlashLoading(true);
    setFlashError('');
    setShowFlashcards(false);
    try {
      // Use the transcript as content, and the video URL as title (or extract title if you want)
      const questions = await geminiQuizGenerator.generateFromText(transcript, url, {
        numQuestions: 8,
        questionTypes: ['flashcard'],
      });
      // Convert Gemini format to FlashcardViewer format
      const flashcardQs = questions.map((q, i) => ({
        id: `${i}`,
        quiz_id: '',
        question_text: q.question,
        answer_text: q.answer,
        is_flashcard: true,
        order_index: i + 1,
        created_at: ''
      }));
      setFlashcards(flashcardQs);
      setShowFlashcards(true);
    } catch (err: any) {
      setFlashError(err.message || 'Failed to generate flashcards');
    } finally {
      setFlashLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <input
          type="text"
          className="border rounded px-3 py-2 w-full text-gray-900"
          placeholder="Enter YouTube video URL"
          value={url}
          onChange={e => setUrl(e.target.value)}
        />
        <Button
          onClick={handleGetTranscript}
          disabled={loading || !url.trim()}
        >
          {loading ? 'Transcribing...' : 'Get Transcript'}
        </Button>
      </div>
      {status && loading && (
        <div className="text-blue-600">Status: {status.charAt(0).toUpperCase() + status.slice(1)}</div>
      )}
      {error && <div className="text-red-600">{error}</div>}
      {transcript && (
        <div className="bg-gray-100 p-4 rounded max-h-96 overflow-y-auto">
          <h3 className="font-semibold mb-2 text-gray-800">Transcript:</h3>
          <div className="text-gray-800 whitespace-pre-wrap leading-relaxed">{transcript}</div>
          <div className="mt-4">
            <Button onClick={handleGenerateFlashcards} disabled={flashLoading}>
              {flashLoading ? 'Generating Flashcards...' : 'Generate Flashcards'}
            </Button>
            {flashError && <div className="text-red-600 mt-2">{flashError}</div>}
          </div>
        </div>
      )}
      {showFlashcards && flashcards.length > 0 && (
        <div className="mt-6">
          <FlashcardViewer questions={flashcards} onClose={() => setShowFlashcards(false)} />
        </div>
      )}
    </div>
  );
};

export default YouTubeInputPanel; 
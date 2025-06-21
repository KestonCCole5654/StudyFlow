import React, { useState, useRef } from 'react';
import { Upload as UploadIcon, Youtube, FileText, Image, X, Loader2, Brain, Settings } from 'lucide-react';
import { Button } from '../ui/button';
import { GeminiQuizGenerator } from '../../lib/gemini';

interface UploadPanelProps {
  onFileUpload: (file: File, options?: QuizGenerationOptions) => Promise<void>;
  onYouTubeUpload: (url: string, options?: QuizGenerationOptions) => Promise<void>;
  loading: boolean;
}

interface QuizGenerationOptions {
  title?: string;
  numQuestions?: number;
  difficulty?: 'easy' | 'medium' | 'hard' | 'mixed';
  useAI?: boolean;
}

export function UploadPanel({ onFileUpload, onYouTubeUpload, loading }: UploadPanelProps) {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [options, setOptions] = useState<QuizGenerationOptions>({
    numQuestions: 5,
    difficulty: 'mixed',
    useAI: true
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isAIConfigured = GeminiQuizGenerator.isConfigured();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileUpload = async (file: File) => {
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      alert('File size must be less than 50MB');
      return;
    }

    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'text/markdown',
      'image/png',
      'image/jpeg',
      'image/jpg',
      'image/webp',
      'video/mp4',
      'video/webm',
    ];

    if (!allowedTypes.includes(file.type)) {
      alert('Unsupported file type. Please upload PDF, Word documents, text files, images, or videos.');
      return;
    }

    const uploadOptions = {
      ...options,
      title: options.title || `Quiz from ${file.name}`
    };

    await onFileUpload(file, uploadOptions);
  };

  const handleYouTubeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!youtubeUrl.trim()) return;

    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
    if (!youtubeRegex.test(youtubeUrl)) {
      alert('Please enter a valid YouTube URL');
      return;
    }

    const uploadOptions = {
      ...options,
      title: options.title || 'Quiz from YouTube Video'
    };

    await onYouTubeUpload(youtubeUrl, uploadOptions);
    setYoutubeUrl('');
  };

  return (
    <div className="space-y-6">
      {/* AI Status Banner */}
      {!isAIConfigured && (
        <div className="bg-yellow-900/20 border border-yellow-700/30 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <Brain className="w-5 h-5 text-yellow-400" />
            <div>
              <h4 className="text-yellow-300 font-medium">Gemini AI Quiz Generation Not Configured</h4>
              <p className="text-yellow-200 text-sm mt-1">
                Add your Google Gemini API key to enable intelligent quiz generation. Currently using sample questions.
              </p>
            </div>
          </div>
        </div>
      )}

      {isAIConfigured && (
        <div className="bg-green-900/20 border border-green-700/30 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <Brain className="w-5 h-5 text-green-400" />
            <div>
              <h4 className="text-green-300 font-medium">🤖 Gemini AI Powered Quiz Generation</h4>
              <p className="text-green-200 text-sm mt-1">
                Advanced AI will analyze your content and generate intelligent, context-aware study questions.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Advanced Options */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700/30">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            Quiz Generation Options
          </h3>
          <Button
            onClick={() => setShowAdvanced(!showAdvanced)}
            variant="outline"
            size="sm"
          >
            {showAdvanced ? 'Hide' : 'Show'} Advanced
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Number of Questions
            </label>
            <select
              value={options.numQuestions}
              onChange={(e) => setOptions(prev => ({ ...prev, numQuestions: parseInt(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-primary-500"
            >
              <option value={3}>3 Questions</option>
              <option value={5}>5 Questions</option>
              <option value={10}>10 Questions</option>
              <option value={15}>15 Questions</option>
              <option value={20}>20 Questions</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Difficulty Level
            </label>
            <select
              value={options.difficulty}
              onChange={(e) => setOptions(prev => ({ ...prev, difficulty: e.target.value as any }))}
              className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-primary-500"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
              <option value="mixed">Mixed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Generation Method
            </label>
            <select
              value={options.useAI ? 'ai' : 'sample'}
              onChange={(e) => setOptions(prev => ({ ...prev, useAI: e.target.value === 'ai' }))}
              className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-primary-500"
            >
              <option value="ai" disabled={!isAIConfigured}>
                Gemini AI Generated {!isAIConfigured ? '(Not Available)' : ''}
              </option>
              <option value="sample">Sample Questions</option>
            </select>
          </div>
        </div>

        {showAdvanced && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Custom Quiz Title (Optional)
            </label>
            <input
              type="text"
              value={options.title || ''}
              onChange={(e) => setOptions(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Leave empty to auto-generate title"
              className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500"
            />
          </div>
        )}
      </div>

      {/* YouTube Upload */}
      <div className="bg-gradient-to-r from-red-900/20 to-red-800/20 rounded-xl p-6 border border-red-700/30">
        <div className="flex items-center space-x-3 mb-4">
          <Youtube className="w-6 h-6 text-red-400" />
          <h3 className="text-lg font-semibold text-white">YouTube Video</h3>
          {isAIConfigured && (
            <div className="flex items-center space-x-1 text-xs bg-green-900/30 text-green-300 px-2 py-1 rounded-full">
              <Brain className="w-3 h-3" />
              <span>Gemini AI Powered</span>
            </div>
          )}
        </div>
        <form onSubmit={handleYouTubeSubmit} className="space-y-4">
          <input
            type="url"
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            placeholder="Paste YouTube URL here..."
            className="w-full px-4 py-3 border border-red-700/30 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-gray-800 text-white placeholder-gray-400"
            disabled={loading}
          />
          <Button
            type="submit"
            disabled={loading || !youtubeUrl.trim()}
            className="w-full bg-red-500 hover:bg-red-600"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating Quiz...
              </>
            ) : (
              <>
                <Brain className="w-4 h-4 mr-2" />
                Generate Quiz from Video
              </>
            )}
          </Button>
        </form>
      </div>

      {/* File Upload */}
      <div className="bg-gradient-to-r from-blue-900/20 to-blue-800/20 rounded-xl p-6 border border-blue-700/30">
        <div className="flex items-center space-x-3 mb-4">
          <UploadIcon className="w-6 h-6 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">Upload Files</h3>
          {isAIConfigured && (
            <div className="flex items-center space-x-1 text-xs bg-green-900/30 text-green-300 px-2 py-1 rounded-full">
              <Brain className="w-3 h-3" />
              <span>Gemini AI Powered</span>
            </div>
          )}
        </div>

        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive
              ? 'border-blue-400 bg-blue-900/20'
              : 'border-gray-600 hover:border-blue-500'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".pdf,.docx,.txt,.md,.png,.jpg,.jpeg,.webp,.mp4,.webm"
            onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
            disabled={loading}
          />

          <div className="space-y-4">
            <div className="flex justify-center space-x-4">
              <FileText className="w-8 h-8 text-gray-400" />
              <Image className="w-8 h-8 text-gray-400" />
              {isAIConfigured && <Brain className="w-8 h-8 text-green-400" />}
            </div>
            <div>
              <p className="text-white font-medium">Drop files here or click to browse</p>
              <p className="text-gray-400 text-sm mt-2">
                Supports: PDF, Word documents, Text files, Images (PNG, JPG, WebP), Videos (MP4, WebM)
              </p>
              <p className="text-gray-500 text-xs mt-1">Maximum file size: 50MB</p>
              {isAIConfigured && (
                <p className="text-green-400 text-xs mt-1">✨ Gemini AI will analyze your content and generate intelligent questions</p>
              )}
            </div>
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
              variant="outline"
              className="border-blue-500 text-blue-400 hover:bg-blue-900/20"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating Quiz...
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4 mr-2" />
                  Choose Files & Generate Quiz
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="mt-4 text-xs text-gray-500">
          <p>Supported formats:</p>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>Documents: PDF, Word (.docx), Text (.txt, .md)</li>
            <li>Images: PNG, JPG, JPEG, WebP {isAIConfigured && <span className="text-green-400">(with AI vision analysis)</span>}</li>
            <li>Videos: MP4, WebM</li>
          </ul>
          {isAIConfigured && (
            <p className="text-green-400 text-xs mt-2">
              🤖 Gemini AI will automatically extract content and generate relevant study questions
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
import React from 'react';
import { format, parseISO } from 'date-fns';
import { FileText, Youtube, Image, Trash2, Play, Clock } from 'lucide-react';
import { Quiz } from '../../types/quiz';
import { Button } from '../ui/button';

interface QuizListProps {
  quizzes: Quiz[];
  onQuizSelect: (quiz: Quiz) => void;
  onQuizDelete: (quizId: string) => void;
  loading: boolean;
}

export function QuizList({ quizzes, onQuizSelect, onQuizDelete, loading }: QuizListProps) {
  const getUploadIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Youtube className="w-5 h-5 text-red-400" />;
      case 'image':
        return <Image className="w-5 h-5 text-green-400" />;
      case 'document':
      default:
        return <FileText className="w-5 h-5 text-blue-400" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (quizzes.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
        <h3 className="text-lg font-medium text-white mb-2">No quizzes yet</h3>
        <p className="text-gray-300">Upload some content to generate your first quiz!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {quizzes.map((quiz) => (
        <div
          key={quiz.id}
          className="bg-gray-800 rounded-xl p-6 border border-gray-700/40 hover:border-primary-500/50 transition-all duration-200"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                {quiz.upload && getUploadIcon(quiz.upload.type)}
                <h3 className="text-lg font-semibold text-white">{quiz.title}</h3>
              </div>
              
              {quiz.description && (
                <p className="text-gray-300 text-sm mb-3">{quiz.description}</p>
              )}
              
              <div className="flex items-center space-x-4 text-sm text-gray-400">
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{format(parseISO(quiz.created_at), 'MMM d, yyyy')}</span>
                </div>
                {quiz.upload && (
                  <span className="capitalize">{quiz.upload.type}</span>
                )}
                {quiz.questions && (
                  <span>{quiz.questions.length} questions</span>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-2 ml-4">
              <Button
                onClick={() => onQuizSelect(quiz)}
                size="sm"
                className="bg-primary-500 hover:bg-primary-600"
              >
                <Play className="w-4 h-4 mr-1" />
                Study
              </Button>
              <Button
                onClick={() => onQuizDelete(quiz.id)}
                size="sm"
                variant="destructive"
                className="p-2"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
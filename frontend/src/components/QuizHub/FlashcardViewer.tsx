import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, RotateCcw, Eye, EyeOff } from 'lucide-react';
import { Question } from '../../types/quiz';
import { Button } from '../ui/button';

interface FlashcardViewerProps {
  questions: Question[];
  onClose: () => void;
}

export function FlashcardViewer({ questions, onClose }: FlashcardViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  const currentQuestion = questions[currentIndex];

  const nextCard = () => {
    setCurrentIndex((prev) => (prev + 1) % questions.length);
    setShowAnswer(false);
  };

  const prevCard = () => {
    setCurrentIndex((prev) => (prev - 1 + questions.length) % questions.length);
    setShowAnswer(false);
  };

  const toggleAnswer = () => {
    setShowAnswer(!showAnswer);
  };

  const resetProgress = () => {
    setCurrentIndex(0);
    setShowAnswer(false);
  };

  if (!currentQuestion) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p>No questions available</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold text-white">Study Flashcards</h2>
          <span className="text-sm text-gray-400">
            {currentIndex + 1} of {questions.length}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={resetProgress} size="sm" variant="outline">
            <RotateCcw className="w-4 h-4 mr-1" />
            Reset
          </Button>
          <Button onClick={onClose} size="sm" variant="outline">
            Close
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-700 rounded-full h-2 mb-8">
        <div
          className="bg-primary-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Flashcard */}
      <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700/40 min-h-[300px] flex flex-col justify-center">
        <div className="text-center space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-300">Question</h3>
            <p className="text-xl text-white leading-relaxed">
              {currentQuestion.question_text}
            </p>
          </div>

          {showAnswer && (
            <div className="space-y-4 pt-6 border-t border-gray-700">
              <h3 className="text-lg font-medium text-gray-300">Answer</h3>
              <p className="text-xl text-primary-300 leading-relaxed">
                {currentQuestion.answer_text}
              </p>
            </div>
          )}

          <Button
            onClick={toggleAnswer}
            className="bg-primary-500 hover:bg-primary-600"
          >
            {showAnswer ? (
              <>
                <EyeOff className="w-4 h-4 mr-2" />
                Hide Answer
              </>
            ) : (
              <>
                <Eye className="w-4 h-4 mr-2" />
                Show Answer
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-6">
        <Button
          onClick={prevCard}
          disabled={questions.length <= 1}
          variant="outline"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Previous
        </Button>

        <div className="flex space-x-2">
          {questions.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentIndex(index);
                setShowAnswer(false);
              }}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentIndex
                  ? 'bg-primary-500'
                  : 'bg-gray-600 hover:bg-gray-500'
              }`}
            />
          ))}
        </div>

        <Button
          onClick={nextCard}
          disabled={questions.length <= 1}
          variant="outline"
        >
          Next
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}
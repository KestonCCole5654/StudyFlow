import React, { useState } from 'react';
import { ArrowLeft, CheckCircle, XCircle, RotateCcw } from 'lucide-react';
import { Quiz, Question } from '../../types/quiz';
import { Button } from '../ui/button';

interface QuizDetailPageProps {
  quiz: Quiz;
  questions: Question[];
  onBack: () => void;
}

export function QuizDetailPage({ quiz, questions, onBack }: QuizDetailPageProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [revealedAnswers, setRevealedAnswers] = useState<Set<string>>(new Set());

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  const handleAnswerChange = (questionId: string, answer: string) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const revealAnswer = (questionId: string) => {
    setRevealedAnswers(prev => new Set([...prev, questionId]));
  };

  const nextQuestion = () => {
    if (isLastQuestion) {
      setShowResults(true);
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const prevQuestion = () => {
    setCurrentQuestionIndex(prev => Math.max(0, prev - 1));
  };

  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setShowResults(false);
    setRevealedAnswers(new Set());
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach(question => {
      const userAnswer = userAnswers[question.id]?.toLowerCase().trim();
      const correctAnswer = question.answer_text.toLowerCase().trim();
      if (userAnswer && correctAnswer.includes(userAnswer)) {
        correct++;
      }
    });
    return { correct, total: questions.length };
  };

  if (showResults) {
    const { correct, total } = calculateScore();
    const percentage = Math.round((correct / total) * 100);

    return (
      <div className="max-w-2xl mx-auto">
        <div className="text-center space-y-6">
          <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700/40">
            <h2 className="text-2xl font-bold text-white mb-4">Quiz Complete!</h2>
            <div className="text-6xl font-bold mb-4">
              <span className={percentage >= 70 ? 'text-green-400' : percentage >= 50 ? 'text-yellow-400' : 'text-red-400'}>
                {percentage}%
              </span>
            </div>
            <p className="text-gray-300 text-lg">
              You got {correct} out of {total} questions correct
            </p>
          </div>

          <div className="flex space-x-4 justify-center">
            <Button onClick={resetQuiz} className="bg-primary-500 hover:bg-primary-600">
              <RotateCcw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            <Button onClick={onBack} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Quizzes
            </Button>
          </div>

          {/* Review Answers */}
          <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700/40 text-left">
            <h3 className="text-lg font-semibold text-white mb-4">Review Answers</h3>
            <div className="space-y-4">
              {questions.map((question, index) => {
                const userAnswer = userAnswers[question.id];
                const isCorrect = userAnswer?.toLowerCase().trim().includes(
                  question.answer_text.toLowerCase().trim()
                );

                return (
                  <div key={question.id} className="border-b border-gray-700 pb-4 last:border-b-0">
                    <div className="flex items-start space-x-3">
                      {isCorrect ? (
                        <CheckCircle className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-400 mt-1 flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <p className="text-white font-medium mb-2">
                          {index + 1}. {question.question_text}
                        </p>
                        <p className="text-gray-400 text-sm mb-1">
                          Your answer: {userAnswer || 'No answer provided'}
                        </p>
                        <p className="text-green-300 text-sm">
                          Correct answer: {question.answer_text}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button onClick={onBack} variant="outline" size="sm">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div className="text-center">
          <h1 className="text-xl font-semibold text-white">{quiz.title}</h1>
          <p className="text-sm text-gray-400">
            Question {currentQuestionIndex + 1} of {questions.length}
          </p>
        </div>
        <div className="w-20" /> {/* Spacer for centering */}
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-700 rounded-full h-2 mb-8">
        <div
          className="bg-primary-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Question */}
      <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700/40 mb-6">
        <h2 className="text-xl font-medium text-white mb-6">
          {currentQuestion.question_text}
        </h2>

        <div className="space-y-4">
          <textarea
            value={userAnswers[currentQuestion.id] || ''}
            onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
            placeholder="Type your answer here..."
            className="w-full px-4 py-3 border border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-gray-900 text-white placeholder-gray-400 resize-none"
            rows={3}
          />

          {revealedAnswers.has(currentQuestion.id) && (
            <div className="bg-primary-900/20 border border-primary-700/30 rounded-lg p-4">
              <p className="text-primary-300 font-medium">Answer:</p>
              <p className="text-white mt-1">{currentQuestion.answer_text}</p>
            </div>
          )}

          <Button
            onClick={() => revealAnswer(currentQuestion.id)}
            variant="outline"
            size="sm"
            disabled={revealedAnswers.has(currentQuestion.id)}
          >
            {revealedAnswers.has(currentQuestion.id) ? 'Answer Revealed' : 'Reveal Answer'}
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          onClick={prevQuestion}
          disabled={currentQuestionIndex === 0}
          variant="outline"
        >
          Previous
        </Button>

        <div className="flex space-x-2">
          {questions.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentQuestionIndex(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentQuestionIndex
                  ? 'bg-primary-500'
                  : userAnswers[questions[index].id]
                  ? 'bg-green-500'
                  : 'bg-gray-600 hover:bg-gray-500'
              }`}
            />
          ))}
        </div>

        <Button
          onClick={nextQuestion}
          className="bg-primary-500 hover:bg-primary-600"
        >
          {isLastQuestion ? 'Finish Quiz' : 'Next'}
        </Button>
      </div>
    </div>
  );
}
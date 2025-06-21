import React from 'react';
import { Link } from 'react-router-dom';
import { Play, Calendar, Zap, BookOpen } from 'lucide-react';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Navbar/Header */}
      <header className="absolute top-0 left-0 w-full bg-gray-900/90 shadow-sm py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center z-10">
        <div className="flex-shrink-0 flex items-center space-x-2">
          <BookOpen className="h-6 w-6 text-primary-400" />
          <span className="text-2xl font-bold text-white">Study Flow</span>
        </div>
        <nav>
          <ul className="flex space-x-6">
            <li>
              <Link to="/login" className="text-gray-300 hover:text-primary-400 font-medium transition-colors duration-200">
                Log In
              </Link>
            </li>
            <li>
              <Link
                to="/signup"
                className="rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 transition-colors duration-200"
              >
                Sign Up
              </Link>
            </li>
          </ul>
        </nav>
      </header>

      {/* Hero Section */}
      <div className="text-center mb-16 max-w-4xl mt-20">
        <h1 className="text-5xl font-extrabold text-gray-900 sm:text-6xl mb-4">
          Boost Your Focus, Master Your Studies.
        </h1>
        <p className="mt-4 text-xl text-gray-600 leading-8">
          Unlock your potential with Bolt, the ultimate study companion designed to help you organize sessions, track progress, and stay focused.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Link
            to="/signup"
            className="rounded-md bg-primary-600 px-6 py-3 text-lg font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 transition-colors duration-200"
          >
            Get Started
          </Link>
          <Link to="/login" className="text-lg font-semibold leading-6 text-gray-900 hover:text-primary-600 transition-colors duration-200">
            Log In <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <div className="w-full max-w-6xl">
        <h2 className="text-4xl font-bold text-gray-900 text-center mb-12">Features Designed for Success</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1: Intuitive Timer */}
          <div className="bg-white rounded-xl shadow-lg p-8 flex flex-col items-center text-center transform hover:scale-105 transition-transform duration-300">
            <div className="p-4 bg-primary-100 rounded-full mb-6">
              <Play className="h-10 w-10 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Intuitive Study Timer</h3>
            <p className="text-gray-600">
              Stay on track with a customizable timer. Focus on your tasks without distractions and track your progress seamlessly.
            </p>
          </div>

          {/* Feature 2: Session Organization */}
          <div className="bg-white rounded-xl shadow-lg p-8 flex flex-col items-center text-center transform hover:scale-105 transition-transform duration-300">
            <div className="p-4 bg-purple-100 rounded-full mb-6">
              <Calendar className="h-10 w-10 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Organize Your Sessions</h3>
            <p className="text-gray-600">
              Plan and manage your study sessions with ease. Categorize by subject, add notes, and mark completion.
            </p>
          </div>

          {/* Feature 3: Analytics and Insights */}
          <div className="bg-white rounded-xl shadow-lg p-8 flex flex-col items-center text-center transform hover:scale-105 transition-transform duration-300">
            <div className="p-4 bg-green-100 rounded-full mb-6">
              <Zap className="h-10 w-10 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Track Your Progress</h3>
            <p className="text-gray-600">
              Gain valuable insights into your study habits. See how much time you've spent, and identify areas for improvement.
            </p>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="w-full max-w-6xl mt-20">
        <h2 className="text-4xl font-bold text-gray-900 text-center mb-12">How Study Flow Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="bg-white rounded-xl shadow-lg p-8 flex flex-col items-center text-center transform hover:scale-105 transition-transform duration-300">
            <div className="p-4 bg-blue-100 rounded-full mb-6">
              <BookOpen className="h-10 w-10 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">1. Create a Study Session</h3>
            <p className="text-gray-600">
              Easily plan your study time by creating sessions with titles, subjects, and durations. Organize your learning journey.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-white rounded-xl shadow-lg p-8 flex flex-col items-center text-center transform hover:scale-105 transition-transform duration-300">
            <div className="p-4 bg-red-100 rounded-full mb-6">
              <Play className="h-10 w-10 text-red-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">2. Start the Timer</h3>
            <p className="text-gray-600">
              Initiate a focused study period with our intuitive timer. Enter focus mode to minimize distractions and maximize productivity.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-white rounded-xl shadow-lg p-8 flex flex-col items-center text-center transform hover:scale-105 transition-transform duration-300">
            <div className="p-4 bg-yellow-100 rounded-full mb-6">
              <Calendar className="h-10 w-10 text-yellow-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">3. Track Your Progress</h3>
            <p className="text-gray-600">
              Monitor your completed sessions and analyze your study habits over time to see your improvements and achievements.
            </p>
          </div>
        </div>
      </div>

      {/* Demo Video Section */}
      <div className="w-full max-w-6xl mt-20">
        <h2 className="text-4xl font-bold text-gray-900 text-center mb-12">See Study Flow in Action</h2>
        <div className="aspect-w-16 aspect-h-9 bg-gray-200 rounded-xl overflow-hidden shadow-lg flex items-center justify-center p-8">
          {/* Placeholder for embedded video */}
          <p className="text-gray-600 text-lg">Video Demo Coming Soon!</p>
          {/* Example of how to embed a YouTube video (replace with your actual video iframe) */}
          {/*
          <iframe
            width="560"
            height="315"
            src="https://www.youtube.com/embed/YOUR_VIDEO_ID"
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
          */}
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="w-full max-w-6xl mt-20">
        <h2 className="text-4xl font-bold text-gray-900 text-center mb-12">What Our Users Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Testimonial 1 */}
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <p className="text-gray-700 italic mb-4">
              "Study Flow has transformed my study habits! The timer keeps me focused, and organizing sessions has never been easier."
            </p>
            <p className="font-semibold text-primary-600">- Jane Doe</p>
            <p className="text-sm text-gray-500">University Student</p>
          </div>

          {/* Testimonial 2 */}
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <p className="text-gray-700 italic mb-4">
              "I love the simplicity and effectiveness of Study Flow. It's truly helped me improve my productivity and track my progress."
            </p>
            <p className="font-semibold text-primary-600">- John Smith</p>
            <p className="text-sm text-gray-500">High School Teacher</p>
          </div>

          {/* Testimonial 3 (Optional for larger screens) */}
          <div className="bg-white rounded-xl shadow-lg p-8 text-center hidden lg:block">
            <p className="text-gray-700 italic mb-4">
              "This app is a game-changer! The focus mode and session tracking are exactly what I needed to stay on top of my studies."
            </p>
            <p className="font-semibold text-primary-600">- Emily White</p>
            <p className="text-sm text-gray-500">PhD Candidate</p>
          </div>
        </div>
      </div>

      {/* FAQs Section */}
      <div className="w-full max-w-6xl mt-20">
        <h2 className="text-4xl font-bold text-gray-900 text-center mb-12">Frequently Asked Questions</h2>
        <div className="space-y-6">
          {/* FAQ Item 1 */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">What is Study Flow?</h3>
            <p className="text-gray-700">
              Study Flow is an all-in-one study companion designed to help students and learners organize their study sessions, track their progress, and improve focus.
            </p>
          </div>

          {/* FAQ Item 2 */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Is Study Flow free to use?</h3>
            <p className="text-gray-700">
              Yes, Study Flow offers a robust free tier with core features. Premium features may be introduced in the future.
            </p>
          </div>

          {/* FAQ Item 3 */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I use Study Flow on any device?</h3>
            <p className="text-gray-700">
              Study Flow is a web-based application, meaning you can access it from any device with a modern web browser, including desktops, laptops, and tablets.
            </p>
          </div>
        </div>
      </div>

      {/* Get Started Section (formerly Call to Action - Join Today) */}
      <div className="mt-20 text-center bg-primary-700 text-white p-12 rounded-2xl max-w-4xl shadow-xl">
        <h2 className="text-4xl font-bold mb-6">Ready to Get Started?</h2>
        <p className="text-lg mb-8">
          Join thousands of students who are boosting their productivity and achieving their academic dreams with Study Flow.
        </p>
        <Link
          to="/signup"
          className="rounded-md bg-white px-8 py-4 text-xl font-semibold text-primary-700 shadow-sm hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white transition-colors duration-200"
        >
          Sign Up Now!
        </Link>
      </div>

      {/* Footer */}
      <footer className="mt-20 text-center text-gray-500 text-sm">
        <p>&copy; {new Date().getFullYear()} Bolt. All rights reserved.</p>
        <p className="mt-2">
          <Link to="#" className="hover:text-primary-600 transition-colors duration-200">Privacy Policy</Link> • <Link to="#" className="hover:text-primary-600 transition-colors duration-200">Terms of Service</Link>
        </p>
      </footer>
    </div>
  );
} 
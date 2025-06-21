import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export function SessionExpiredModal() {
  const { showSessionExpired, signIn, setShowSessionExpired } = useAuth();

  if (!showSessionExpired) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-md animate-slide-up border border-gray-700">
        <div className="flex items-center justify-center mb-4">
          <AlertCircle className="w-12 h-12 text-yellow-500" />
        </div>
        
        <h2 className="text-xl font-semibold text-white text-center mb-2">
          Session Expired
        </h2>
        
        <p className="text-gray-300 text-center mb-6">
          Your session has expired. Please sign in again to continue using the application.
        </p>

        <div className="flex flex-col space-y-3">
          <button
            onClick={() => {
              setShowSessionExpired(false);
              window.location.reload();
            }}
            className="w-full px-4 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg hover:from-primary-600 hover:to-primary-700 transition-all duration-200 flex items-center justify-center"
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            Refresh Session
          </button>
          
          <button
            onClick={() => signIn('', '')}
            className="w-full px-4 py-3 border border-gray-700 text-gray-200 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Sign In Again
          </button>
        </div>
      </div>
    </div>
  );
} 
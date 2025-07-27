import React, { useState } from 'react';
import { LoginForm } from './LoginForm';
import { Music, Sparkles, Heart, Zap } from 'lucide-react';

export const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);

  const toggleMode = () => setIsLogin(!isLogin);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Branding */}
        <div className="text-center lg:text-left space-y-6">
          <div className="flex items-center justify-center lg:justify-start gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
              <Music className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              PAS
            </h1>
          </div>
          
          <div className="space-y-4">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900">
              Personalized
              <span className="block bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Assertive Songs
              </span>
            </h2>
            
            <p className="text-xl text-gray-600 max-w-md mx-auto lg:mx-0">
              Generate motivational songs tailored to your emotional and psychological goals using AI.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-md mx-auto lg:mx-0">
            <div className="flex flex-col items-center p-4 bg-white/60 rounded-lg backdrop-blur-sm">
              <Sparkles className="h-8 w-8 text-purple-600 mb-2" />
              <span className="text-sm font-medium text-gray-700">AI Lyrics</span>
            </div>
            <div className="flex flex-col items-center p-4 bg-white/60 rounded-lg backdrop-blur-sm">
              <Heart className="h-8 w-8 text-pink-600 mb-2" />
              <span className="text-sm font-medium text-gray-700">Mood Based</span>
            </div>
            <div className="flex flex-col items-center p-4 bg-white/60 rounded-lg backdrop-blur-sm">
              <Zap className="h-8 w-8 text-indigo-600 mb-2" />
              <span className="text-sm font-medium text-gray-700">Instant Audio</span>
            </div>
          </div>
          
          <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 max-w-md mx-auto lg:mx-0">
            <h3 className="font-semibold text-gray-900 mb-2">✨ Free Plan Includes:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 3 songs per day</li>
              <li>• All genres and moods</li>
              <li>• Lyrics generation</li>
              <li>• Audio creation</li>
              <li>• Song history</li>
            </ul>
          </div>
        </div>
        
        {/* Right Side - Auth Form */}
        <div className="flex items-center justify-center">
          <LoginForm onToggleMode={toggleMode} isLogin={isLogin} />
        </div>
      </div>
    </div>
  );
};
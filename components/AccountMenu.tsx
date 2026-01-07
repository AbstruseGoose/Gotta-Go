'use client';

import { useState, useRef, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import AuthModal from './AuthModal';

export default function AccountMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { user, profile, signOut, isAdmin, isModerator, isConfigured } = useAuth();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold hover:scale-110 transition-transform shadow-lg"
      >
        👤
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 glass-card rounded-xl shadow-2xl overflow-hidden z-50">
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              {user && profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.full_name || 'User'}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl">
                  👤
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">
                  {user ? profile?.full_name || profile?.email || 'User' : 'Guest User'}
                </p>
                <div className="flex items-center gap-1">
                  <p className="text-xs text-gray-400 truncate">
                    {user ? profile?.email : 'Not signed in'}
                  </p>
                  {profile?.role && profile.role !== 'user' && (
                    <span className={`text-xs px-1.5 py-0.5 rounded ${
                      profile.role === 'admin' ? 'bg-red-500/20 text-red-300' : 'bg-blue-500/20 text-blue-300'
                    }`}>
                      {profile.role}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="p-2">
            <button
              onClick={toggleTheme}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{theme === 'dark' ? '🌙' : '☀️'}</span>
                <span className="font-medium">Theme</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">
                  {theme === 'dark' ? 'Dark' : 'Light'}
                </span>
                <div className="relative w-12 h-6 bg-white/10 rounded-full">
                  <div
                    className={`absolute top-1 w-4 h-4 bg-blue-500 rounded-full transition-transform ${
                      theme === 'dark' ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </div>
              </div>
            </button>

            {!isConfigured && (
              <div className="px-4 py-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-sm">
                <p className="text-yellow-300 mb-1">⚠️ Auth not configured</p>
                <p className="text-yellow-400/70 text-xs">Set up Supabase to enable authentication</p>
              </div>
            )}

            {!user ? (
              <button
                onClick={() => {
                  setShowAuthModal(true);
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 rounded-lg transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!isConfigured}
              >
                <span className="text-xl">🔐</span>
                <span className="font-medium">Sign In</span>
              </button>
            ) : (
              <>
                {isAdmin && (
                  <Link
                    href="/admin"
                    onClick={() => setIsOpen(false)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 rounded-lg transition-colors text-left"
                  >
                    <span className="text-xl">👑</span>
                    <span className="font-medium">Admin Panel</span>
                  </Link>
                )}

                {isModerator && !isAdmin && (
                  <Link
                    href="/admin"
                    onClick={() => setIsOpen(false)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 rounded-lg transition-colors text-left"
                  >
                    <span className="text-xl">🛡️</span>
                    <span className="font-medium">Moderator Panel</span>
                  </Link>
                )}

                <Link
                  href="/profile"
                  onClick={() => setIsOpen(false)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 rounded-lg transition-colors text-left"
                >
                  <span className="text-xl">👤</span>
                  <span className="font-medium">My Profile</span>
                </Link>

                <button
                  onClick={() => {
                    signOut();
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 rounded-lg transition-colors text-left text-red-400 hover:text-red-300"
                >
                  <span className="text-xl">🚪</span>
                  <span className="font-medium">Sign Out</span>
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
}

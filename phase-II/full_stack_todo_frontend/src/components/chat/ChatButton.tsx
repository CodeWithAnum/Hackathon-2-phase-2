'use client';

import React from 'react';

interface ChatButtonProps {
  onClick: () => void;
}

export function ChatButton({ onClick }: ChatButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-40
                 bg-gradient-to-r from-primary-500 to-accent-purple
                 hover:from-primary-600 hover:to-accent-purple
                 text-white rounded-full p-4
                 shadow-glow-primary hover:shadow-glow-accent
                 transition-all duration-200
                 flex items-center justify-center
                 group"
      aria-label="Open chat"
    >
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
        />
      </svg>
    </button>
  );
}

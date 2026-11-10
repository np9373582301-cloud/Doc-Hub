import React from 'react';

export default function LoadingSpinner({ text = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      <p className="text-slate-500 text-sm">{text}</p>
    </div>
  );
}

export function InlineSpinner() {
  return <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />;
}

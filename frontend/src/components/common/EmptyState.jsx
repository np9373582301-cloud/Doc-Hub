import React from 'react';

export default function EmptyState({ icon = '📭', title = 'No data found', description = 'Nothing to show here yet.', action }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-slate-700">{title}</h3>
      <p className="text-slate-500 text-sm mt-1 max-w-xs">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

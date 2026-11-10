import React from 'react';

const statusConfig = {
  Confirmed:      { bg: 'bg-blue-100',   text: 'text-blue-700',   dot: 'bg-blue-500' },
  Pending:        { bg: 'bg-yellow-100', text: 'text-yellow-700', dot: 'bg-yellow-500' },
  Completed:      { bg: 'bg-green-100',  text: 'text-green-700',  dot: 'bg-green-500' },
  Cancelled:      { bg: 'bg-red-100',    text: 'text-red-700',    dot: 'bg-red-500' },
  Paid:           { bg: 'bg-green-100',  text: 'text-green-700',  dot: 'bg-green-500' },
  'Partially Paid':{ bg: 'bg-orange-100', text: 'text-orange-700', dot: 'bg-orange-500' },
  'In Progress':  { bg: 'bg-blue-100',   text: 'text-blue-700',   dot: 'bg-blue-500' },
  Planned:        { bg: 'bg-purple-100', text: 'text-purple-700', dot: 'bg-purple-500' },
  Active:         { bg: 'bg-green-100',  text: 'text-green-700',  dot: 'bg-green-500' },
};

export default function StatusBadge({ status }) {
  const cfg = statusConfig[status] || { bg: 'bg-gray-100', text: 'text-gray-700', dot: 'bg-gray-500' };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {status}
    </span>
  );
}

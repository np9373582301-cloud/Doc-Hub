import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

export default function Pagination({ page, pages, total, limit, onPageChange }) {
  if (pages <= 1) return null;
  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
      <p className="text-sm text-slate-500">Showing <span className="font-medium">{from}–{to}</span> of <span className="font-medium">{total}</span></p>
      <div className="flex items-center gap-1">
        <button onClick={() => onPageChange(page - 1)} disabled={page === 1}
          className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
          <ChevronLeftIcon className="w-4 h-4" />
        </button>
        {Array.from({ length: Math.min(pages, 5) }, (_, i) => {
          const p = i + 1;
          return (
            <button key={p} onClick={() => onPageChange(p)}
              className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                p === page ? 'bg-primary-600 text-white' : 'border border-gray-200 hover:bg-gray-50 text-slate-700'
              }`}>{p}</button>
          );
        })}
        <button onClick={() => onPageChange(page + 1)} disabled={page === pages}
          className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
          <ChevronRightIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

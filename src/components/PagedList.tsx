import React, { ReactNode, useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PagedListProps<T> {
  items: T[];
  pageSize: number;
  renderItem: (item: T, index: number) => ReactNode;
  getKey?: (item: T, index: number) => React.Key;
  empty?: ReactNode;
  className?: string;
  gridClassName?: string;
  controlsClassName?: string;
}

export default function PagedList<T>({
  items,
  pageSize,
  renderItem,
  getKey,
  empty,
  className = '',
  gridClassName = 'space-y-3',
  controlsClassName = '',
}: PagedListProps<T>) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));

  useEffect(() => {
    setPage((current) => Math.min(current, totalPages));
  }, [totalPages]);

  const pageItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, page, pageSize]);

  return (
    <div className={`flex min-h-0 flex-1 flex-col ${className}`}>
      <div className={`min-h-0 flex-1 overflow-hidden ${gridClassName}`}>
        {items.length === 0
          ? empty
          : pageItems.map((item, index) => (
              <React.Fragment key={getKey ? getKey(item, index) : index}>
                {renderItem(item, (page - 1) * pageSize + index)}
              </React.Fragment>
            ))}
      </div>
      {totalPages > 1 && (
        <div className={`mt-2 flex shrink-0 items-center justify-center gap-3 text-xs text-zinc-400 ${controlsClassName}`}>
          <button
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            disabled={page === 1}
            className="rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-zinc-200 hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft size={14} />
          </button>
          <span className="font-mono">{page} / {totalPages}</span>
          <button
            onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
            disabled={page === totalPages}
            className="rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-zinc-200 hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}

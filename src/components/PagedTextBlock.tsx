import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PagedTextBlockProps {
  text: string;
  pageChars?: number;
  className?: string;
  textClassName?: string;
}

const splitPages = (text: string, pageChars: number) => {
  const clean = text.trim();
  if (!clean) return [''];
  const pages: string[] = [];
  for (let i = 0; i < clean.length; i += pageChars) {
    pages.push(clean.slice(i, i + pageChars));
  }
  return pages;
};

const PagedTextBlock: React.FC<PagedTextBlockProps> = ({
  text,
  pageChars = 95,
  className = '',
  textClassName = '',
}) => {
  const pages = useMemo(() => splitPages(text, pageChars), [text, pageChars]);
  const [page, setPage] = useState(0);

  return (
    <div className={className}>
      <div className={textClassName}>{pages[page]}</div>
      {pages.length > 1 && (
        <div className="mt-2 flex items-center justify-between text-[10px] text-zinc-500">
          <button
            onClick={() => setPage((v) => Math.max(0, v - 1))}
            disabled={page === 0}
            className="flex items-center gap-1 px-2 py-1 rounded bg-zinc-900/70 hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={12} />
            上一页
          </button>
          <span className="font-mono">{page + 1}/{pages.length}</span>
          <button
            onClick={() => setPage((v) => Math.min(pages.length - 1, v + 1))}
            disabled={page === pages.length - 1}
            className="flex items-center gap-1 px-2 py-1 rounded bg-zinc-900/70 hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            下一页
            <ChevronRight size={12} />
          </button>
        </div>
      )}
    </div>
  );
};

export default PagedTextBlock;


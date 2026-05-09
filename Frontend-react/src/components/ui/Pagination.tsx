// @ts-nocheck
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50],
  className = '',
}: PaginationProps) {
  if (totalPages <= 1 && totalItems <= pageSizeOptions[0]) return null;

  const start = (currentPage - 1) * pageSize + 1;
  const end   = Math.min(currentPage * pageSize, totalItems);

  // Génère les numéros de pages à afficher (avec ellipsis)
  const getPages = (): (number | '...')[] => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | '...')[] = [1];
    if (currentPage > 3) pages.push('...');
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push('...');
    pages.push(totalPages);
    return pages;
  };

  const btnBase = `
    flex items-center justify-center w-9 h-9 rounded-xl text-sm font-medium
    transition-all duration-150 touch-manipulation
  `;
  const btnActive = `${btnBase} bg-primary text-white shadow-sm`;
  const btnNormal = `${btnBase} border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300`;
  const btnDisabled = `${btnBase} border border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed`;

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100 ${className}`}>
      {/* Info */}
      <div className="flex items-center gap-3">
        <p className="text-sm text-slate-500">
          <span className="font-semibold text-slate-700">{start}–{end}</span> sur{' '}
          <span className="font-semibold text-slate-700">{totalItems}</span>
        </p>
        {onPageSizeChange && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Par page :</span>
            <select
              value={pageSize}
              onChange={(e) => { onPageSizeChange(Number(e.target.value)); onPageChange(1); }}
              className="h-8 px-2 rounded-lg border border-slate-200 text-xs text-slate-700 bg-white focus:outline-none focus:border-primary transition-all cursor-pointer"
            >
              {pageSizeOptions.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Contrôles */}
      <div className="flex items-center gap-1">
        {/* Première page */}
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className={currentPage === 1 ? btnDisabled : btnNormal}
          title="Première page"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>

        {/* Page précédente */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={currentPage === 1 ? btnDisabled : btnNormal}
          title="Page précédente"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Numéros de pages */}
        <div className="flex items-center gap-1">
          {getPages().map((p, i) =>
            p === '...' ? (
              <span key={`ellipsis-${i}`} className="w-9 h-9 flex items-center justify-center text-slate-400 text-sm">
                …
              </span>
            ) : (
              <button
                key={p}
                onClick={() => onPageChange(p as number)}
                className={p === currentPage ? btnActive : btnNormal}
              >
                {p}
              </button>
            )
          )}
        </div>

        {/* Page suivante */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={currentPage === totalPages ? btnDisabled : btnNormal}
          title="Page suivante"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Dernière page */}
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className={currentPage === totalPages ? btnDisabled : btnNormal}
          title="Dernière page"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

/** Hook utilitaire pour gérer la pagination côté client */
export function usePagination<T>(items: T[], pageSize: number, currentPage: number) {
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage   = Math.min(Math.max(1, currentPage), totalPages);
  const start      = (safePage - 1) * pageSize;
  const paged      = items.slice(start, start + pageSize);
  return { paged, totalItems, totalPages, safePage };
}

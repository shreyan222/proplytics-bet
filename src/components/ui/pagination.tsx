import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (itemsPerPage: number | string) => void;
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
}: PaginationProps) {
  // Add safety checks for undefined/null values
  const safeCurrentPage = currentPage || 1;
  const safeTotalPages = totalPages || 1;
  const safeTotalItems = totalItems || 0;
  const safeItemsPerPage = itemsPerPage || 25;
  
  const startItem = (safeCurrentPage - 1) * safeItemsPerPage + 1;
  const endItem = Math.min(safeCurrentPage * safeItemsPerPage, safeTotalItems);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (safeTotalPages <= maxVisiblePages) {
      for (let i = 1; i <= safeTotalPages; i++) {
        pages.push(i);
      }
    } else {
      if (safeCurrentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(safeTotalPages);
      } else if (safeCurrentPage >= safeTotalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = safeTotalPages - 3; i <= safeTotalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = safeCurrentPage - 1; i <= safeCurrentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(safeTotalPages);
      }
    }
    
    return pages;
  };

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-slate-800/50 border-t border-slate-700">
      <div className="flex items-center gap-4">
        <div className="text-sm text-slate-400">
          Showing {startItem} to {endItem} of {totalItems} props
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-400">Show:</span>
          <Select value={safeItemsPerPage === safeTotalItems ? "max" : safeItemsPerPage.toString()} onValueChange={(value) => onItemsPerPageChange(value)}>
            <SelectTrigger className="w-20 h-8 bg-slate-700 border-slate-600 text-slate-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-600">
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
              <SelectItem value="max">Max</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-sm text-slate-400">per page</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(1)}
          disabled={safeCurrentPage === 1}
          className="h-8 w-8 p-0 bg-slate-700 border-slate-600 text-slate-200 hover:bg-slate-600 disabled:opacity-50"
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(safeCurrentPage - 1)}
          disabled={safeCurrentPage === 1}
          className="h-8 w-8 p-0 bg-slate-700 border-slate-600 text-slate-200 hover:bg-slate-600 disabled:opacity-50"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="flex items-center gap-1">
          {getPageNumbers().map((page, index) => (
            <React.Fragment key={index}>
              {page === '...' ? (
                <span className="px-2 text-slate-400">...</span>
              ) : (
                <Button
                  variant={safeCurrentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPageChange(page as number)}
                  className={`h-8 w-8 p-0 ${
                    safeCurrentPage === page 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-slate-700 border-slate-600 text-slate-200 hover:bg-slate-600'
                  }`}
                >
                  {page}
                </Button>
              )}
            </React.Fragment>
          ))}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(safeCurrentPage + 1)}
          disabled={safeCurrentPage === safeTotalPages}
          className="h-8 w-8 p-0 bg-slate-700 border-slate-600 text-slate-200 hover:bg-slate-600 disabled:opacity-50"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(safeTotalPages)}
          disabled={safeCurrentPage === safeTotalPages}
          className="h-8 w-8 p-0 bg-slate-700 border-slate-600 text-slate-200 hover:bg-slate-600 disabled:opacity-50"
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

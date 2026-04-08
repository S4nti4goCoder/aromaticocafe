import { useState, useMemo, useCallback } from "react";

export function usePagination<T>(items: T[], defaultItemsPerPage = 6) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(defaultItemsPerPage);

  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return items.slice(start, start + itemsPerPage);
  }, [items, currentPage, itemsPerPage]);

  const handlePageChange = useCallback(
    (page: number) => {
      setCurrentPage((prev) => {
        const next = Math.max(1, Math.min(page, totalPages));
        return next === prev ? prev : next;
      });
    },
    [totalPages],
  );

  const handleItemsPerPageChange = useCallback((items: number) => {
    setItemsPerPage(items);
    setCurrentPage(1);
  }, []);

  // Reset cuando cambian los items (ej: búsqueda)
  const reset = useCallback(() => setCurrentPage(1), []);

  return {
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    paginatedItems,
    handlePageChange,
    handleItemsPerPageChange,
    reset,
  };
}

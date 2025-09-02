import { useState, useCallback, useEffect } from "react";
import toast from "react-hot-toast";

interface PaginatedResponse<T> {
  results: T[];
  next: string | null;
  previous: string | null;
  count: number;
}

export const usePaginatedData = <T>(
  fetchFunction: (page: number) => Promise<PaginatedResponse<T>>,
  initialPage = 1
) => {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [nextPage, setNextPage] = useState<string | null>(null);
  const [prevPage, setPrevPage] = useState<string | null>(null);

  const loadData = useCallback(
    async (page = initialPage) => {
      setLoading(true);
      try {
        const response = await fetchFunction(page);
        setData(response.results);
        setNextPage(response.next);
        setPrevPage(response.previous);
        setCurrentPage(page);
      } catch (err) {
        toast.error("Failed to fetch data");
      } finally {
        setLoading(false);
      }
    },
    [fetchFunction, initialPage]
  );

  useEffect(() => {
    loadData(currentPage);
  }, [loadData, currentPage]);

  const goNext = () => nextPage && loadData(currentPage + 1);
  const goPrev = () => prevPage && loadData(currentPage - 1);

  return { data, loading, currentPage, nextPage, prevPage, goNext, goPrev, reload: loadData };
};

import {
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Repository } from "../lib/types";
import { useMediaQuery } from "./use-media-query";

function filterRepos(repos: Repository[], searchTerm: string): Repository[] {
  if (!searchTerm) return repos;

  const term = searchTerm.toLowerCase();
  return repos.filter(
    (repo) =>
      repo.repo.toLowerCase().includes(term) ||
      (repo.desc && repo.desc.toLowerCase().includes(term)),
  );
}

function calculatePaginationStats(
  totalItems: number,
  pageIndex: number,
  pageSize: number,
) {
  const pageCount = Math.ceil(totalItems / pageSize);
  const firstItemOnPage = totalItems === 0 ? 0 : pageIndex * pageSize + 1;
  const lastItemOnPage =
    totalItems === 0 ? 0 : Math.min(firstItemOnPage + pageSize - 1, totalItems);

  return {
    totalFilteredRows: totalItems,
    pageCount,
    firstItemOnPage,
    lastItemOnPage,
  };
}

export function useTable(
  repos: Repository[],
  columns: ColumnDef<Repository>[],
) {
  const isMobile = useMediaQuery("(max-width: 767px)");
  const pageSize = isMobile ? 5 : 10;

  const [sorting, setSorting] = useState<SortingState>([
    { id: "rank", desc: false },
  ]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [globalFilter, setGlobalFilter] = useState("");
  const [pageIndex, setPageIndex] = useState(0);

  const filteredRepos = useMemo(
    () => filterRepos(repos, globalFilter),
    [repos, globalFilter],
  );

  const paginationStats = useMemo(
    () => calculatePaginationStats(filteredRepos.length, pageIndex, pageSize),
    [filteredRepos.length, pageIndex, pageSize],
  );

  const updateGlobalFilter = useCallback((value: string) => {
    setGlobalFilter(value);
    setPageIndex(0);
  }, []);

  useEffect(() => {
    if (
      pageIndex >= paginationStats.pageCount &&
      paginationStats.pageCount > 0
    ) {
      setPageIndex(0);
    }
  }, [pageIndex, paginationStats.pageCount]);

  const pagination = useMemo(
    () => ({
      pageIndex,
      pageCount: paginationStats.pageCount,
      canPreviousPage: pageIndex > 0,
      canNextPage: pageIndex < paginationStats.pageCount - 1,
      previousPage: () => setPageIndex((prev) => prev - 1),
      nextPage: () => setPageIndex((prev) => prev + 1),
    }),
    [pageIndex, paginationStats.pageCount],
  );

  const handleSortingChange = useCallback(
    (updater: SortingState | ((prev: SortingState) => SortingState)) => {
      setSorting(updater);
    },
    [],
  );

  const handleColumnVisibilityChange = useCallback(
    (
      updater: VisibilityState | ((prev: VisibilityState) => VisibilityState),
    ) => {
      setColumnVisibility(updater);
    },
    [],
  );

  const handlePaginationChange = useCallback(
    (
      updater:
        | { pageIndex: number; pageSize: number }
        | ((prev: { pageIndex: number; pageSize: number }) => {
            pageIndex: number;
            pageSize: number;
          }),
    ) => {
      const newPagination =
        typeof updater === "function"
          ? updater({ pageIndex, pageSize })
          : updater;
      setPageIndex(newPagination.pageIndex);
    },
    [pageIndex, pageSize],
  );

  const table = useReactTable({
    data: filteredRepos,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: handleSortingChange,
    onColumnVisibilityChange: handleColumnVisibilityChange,
    onGlobalFilterChange: () => {},
    onPaginationChange: handlePaginationChange,
    state: {
      sorting,
      columnVisibility,
      globalFilter: "",
      pagination: { pageIndex, pageSize },
    },
  });

  return {
    table,
    state: {
      sorting,
      columnVisibility,
      globalFilter,
      pagination: { pageIndex, pageSize },
    },
    paginationStats,
    pagination,
    updateGlobalFilter,
    isMobile,
  };
}

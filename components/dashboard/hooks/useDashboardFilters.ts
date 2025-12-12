import type { Dispatch, SetStateAction } from "react";
import { useCallback, useMemo, useState } from "react";

import {
  computeDefaultDateRange,
  FLOW_FILTERS,
  PAGE_SIZE_OPTIONS,
  SORT_OPTIONS,
} from "../dashboard-utils";
import type { PageSizeOptionValue } from "../dashboard-utils";

export type DashboardFilters = {
  selectedAccount: string;
  setSelectedAccount: (value: string) => void;
  dateRange: { start: string; end: string };
  setDateRange: Dispatch<SetStateAction<{ start: string; end: string }>>;
  pageSize: PageSizeOptionValue;
  setPageSize: (value: PageSizeOptionValue) => void;
  sortOption: string;
  setSortOption: (value: string) => void;
  flowFilter: string;
  setFlowFilter: (value: string) => void;
  currentPage: number;
  setCurrentPage: Dispatch<SetStateAction<number>>;
  numericPageSize: number;
  isShowingAllRows: boolean;
  resetPagination: () => void;
};

export function useDashboardFilters(): DashboardFilters {
  const [selectedAccount, setSelectedAccountState] = useState("all");
  const [dateRange, setDateRangeState] = useState(() =>
    computeDefaultDateRange(),
  );
  const DEFAULT_NUMERIC_PAGE_SIZE = 25 as Exclude<PageSizeOptionValue, "all">;
  const numericDefaultPageSize =
    (PAGE_SIZE_OPTIONS.find(
      (option) => option.value !== "all",
    )?.value as Exclude<PageSizeOptionValue, "all"> | undefined) ??
    DEFAULT_NUMERIC_PAGE_SIZE;
  const defaultPageSizeOption: PageSizeOptionValue = PAGE_SIZE_OPTIONS.some(
    (option) => option.value === "all",
  )
    ? "all"
    : numericDefaultPageSize;
  const defaultSort = SORT_OPTIONS[0]?.value ?? "date_desc";
  const defaultFlowFilter = FLOW_FILTERS[0]?.value ?? "all";
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSizeState] =
    useState<PageSizeOptionValue>(defaultPageSizeOption);
  const [sortOption, setSortOptionState] = useState<string>(defaultSort);
  const [flowFilter, setFlowFilterState] = useState<string>(defaultFlowFilter);
  const resetPagination = useCallback(() => {
    setCurrentPage(0);
  }, []);
  const setSelectedAccount = useCallback(
    (value: string) => {
      resetPagination();
      setSelectedAccountState(value);
    },
    [resetPagination],
  );
  const setDateRange = useCallback(
    (value: SetStateAction<{ start: string; end: string }>) => {
      resetPagination();
      setDateRangeState(value);
    },
    [resetPagination],
  );
  const setPageSize = useCallback(
    (value: PageSizeOptionValue) => {
      resetPagination();
      setPageSizeState(value);
    },
    [resetPagination],
  );
  const setSortOption = useCallback(
    (value: string) => {
      resetPagination();
      setSortOptionState(value);
    },
    [resetPagination],
  );
  const setFlowFilter = useCallback(
    (value: string) => {
      resetPagination();
      setFlowFilterState(value);
    },
    [resetPagination],
  );
  const isShowingAllRows = pageSize === "all";
  const numericPageSize = useMemo(
    () => (typeof pageSize === "number" ? pageSize : numericDefaultPageSize),
    [pageSize, numericDefaultPageSize],
  );

  return {
    selectedAccount,
    setSelectedAccount,
    dateRange,
    setDateRange,
    pageSize,
    setPageSize,
    sortOption,
    setSortOption,
    flowFilter,
    setFlowFilter,
    currentPage,
    setCurrentPage,
    numericPageSize,
    isShowingAllRows,
    resetPagination,
  };
}

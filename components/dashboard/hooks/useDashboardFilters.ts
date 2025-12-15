import type { Dispatch, SetStateAction } from "react";
import { useCallback, useMemo, useState } from "react";

import {
  computeDefaultDateRange,
  FLOW_FILTERS,
  PAGE_SIZE_OPTIONS,
  SORT_OPTIONS,
  DEFAULT_NUMERIC_PAGE_SIZE,
  DEFAULT_PAGE_SIZE_OPTION,
} from "../dashboard-utils";
import type {
  FlowFilterValue,
  PageSizeOptionValue,
  SortOptionValue,
} from "../dashboard-utils";

export type DashboardFilters = {
  selectedAccounts: string[];
  setSelectedAccounts: (value: string[]) => void;
  dateRange: { start: string; end: string };
  setDateRange: Dispatch<SetStateAction<{ start: string; end: string }>>;
  pageSize: PageSizeOptionValue;
  setPageSize: (value: PageSizeOptionValue) => void;
  sortOption: SortOptionValue;
  setSortOption: (value: SortOptionValue) => void;
  flowFilter: FlowFilterValue;
  setFlowFilter: (value: FlowFilterValue) => void;
  categoryFilter: string;
  setCategoryFilter: (value: string) => void;
  currentPage: number;
  setCurrentPage: Dispatch<SetStateAction<number>>;
  numericPageSize: number;
  isShowingAllRows: boolean;
  resetPagination: () => void;
};

export function useDashboardFilters(): DashboardFilters {
  const [selectedAccounts, setSelectedAccountsState] = useState<string[]>([
    "all",
  ]);
  const [dateRange, setDateRangeState] = useState(() =>
    computeDefaultDateRange(),
  );
  const numericDefaultPageSize =
    (PAGE_SIZE_OPTIONS.find(
      (option) => option.value !== "all",
    )?.value as Exclude<PageSizeOptionValue, "all"> | undefined) ??
    DEFAULT_NUMERIC_PAGE_SIZE;
  const defaultPageSizeOption: PageSizeOptionValue = DEFAULT_PAGE_SIZE_OPTION;
  const defaultSort = (SORT_OPTIONS[0]?.value ?? "date_desc") as SortOptionValue;
  const defaultFlowFilter = (FLOW_FILTERS[0]?.value ?? "all") as FlowFilterValue;
  const defaultCategoryFilter = "all";
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSizeState] =
    useState<PageSizeOptionValue>(defaultPageSizeOption);
  const [sortOption, setSortOptionState] =
    useState<SortOptionValue>(defaultSort);
  const [flowFilter, setFlowFilterState] =
    useState<FlowFilterValue>(defaultFlowFilter);
  const [categoryFilter, setCategoryFilterState] =
    useState<string>(defaultCategoryFilter);
  const resetPagination = useCallback(() => {
    setCurrentPage(0);
  }, []);
  const setSelectedAccounts = useCallback(
    (value: string[]) => {
      resetPagination();
      setSelectedAccountsState(value);
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
    (value: SortOptionValue) => {
      resetPagination();
      setSortOptionState(value);
    },
    [resetPagination],
  );
  const setFlowFilter = useCallback(
    (value: FlowFilterValue) => {
      resetPagination();
      setFlowFilterState(value);
    },
    [resetPagination],
  );
  const setCategoryFilter = useCallback(
    (value: string) => {
      resetPagination();
      setCategoryFilterState(value);
    },
    [resetPagination],
  );
  const isShowingAllRows = pageSize === "all";
  const numericPageSize = useMemo(
    () => (typeof pageSize === "number" ? pageSize : numericDefaultPageSize),
    [pageSize, numericDefaultPageSize],
  );

  return {
    selectedAccounts,
    setSelectedAccounts,
    dateRange,
    setDateRange,
    pageSize,
    setPageSize,
    sortOption,
    setSortOption,
    flowFilter,
    setFlowFilter,
    categoryFilter,
    setCategoryFilter,
    currentPage,
    setCurrentPage,
    numericPageSize,
    isShowingAllRows,
    resetPagination,
  };
}

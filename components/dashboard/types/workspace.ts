export type SavedViewMetadata = {
  selectedAccountIds?: string[];
  dateRange?: { start: string; end: string } | null;
  flowFilter?: string;
  categoryFilter?: string;
  sortOption?: string;
  pageSize?: number | "all";
  filtersCollapsed?: boolean;
} | null;

export type SerializedSavedView = {
  id: string;
  name: string;
  slug: string | null;
  isFamilyView: boolean;
  isPinned: boolean;
  metadata: SavedViewMetadata;
  columnConfig: unknown | null;
  createdAt: string;
  updatedAt: string;
};

export type SavedViewsResponse = {
  savedViews: SerializedSavedView[];
  activeSavedViewId: string | null;
};

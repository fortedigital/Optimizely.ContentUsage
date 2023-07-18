import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { ROWS_PER_PAGE_DEFAULT_OPTIONS } from "../../Components/Filters/NumberOfRowsFilter";
import { ContentTypeBase, TableColumn } from "../../types";
import { SortDirection } from "../../dtos";
import { useDebounce } from "./useDebounce";

enum FilteredTableDataQueryParam {
  SortBy = "sortBy",
  Order = "order",
  Query = "query",
  ContentTypeBase = "type",
  ShowColumn = "showColumn",
  Page = "page",
  RowsPerPage = "rowsPerPage",
}

interface FilteredTableDataHookOptions<TableDataType> {
  rows: TableDataType[];
  initialTableColumns: TableColumn<TableDataType>[];
  initialContentTypeBases?: ContentTypeBase[];
  contentTypeBaseColumnId?: FilteredTableDataQueryParam;
  initialSortDirection?: SortDirection;
  rowsPerPageOptions?: number[];
  sortCompareFn?: (
    prevValue: TableDataType,
    nextValue: TableDataType
  ) => number;
  filterFn?: (row: TableDataType, searchValue: string) => boolean;
}

export function useFilteredTableData<TableDataType>({
  rows,
  initialContentTypeBases,
  contentTypeBaseColumnId = FilteredTableDataQueryParam.ContentTypeBase,
  initialTableColumns,
  initialSortDirection = SortDirection.Asc,
  rowsPerPageOptions = ROWS_PER_PAGE_DEFAULT_OPTIONS,
  sortCompareFn,
  filterFn,
}: FilteredTableDataHookOptions<TableDataType>): {
  rows: TableDataType[];
  searchValue: string;
  onSearchChange: React.KeyboardEventHandler<HTMLInputElement>;
  onClearButtonClick: React.MouseEventHandler<HTMLButtonElement>;
  contentTypeBases: ContentTypeBase[];
  onContentTypeBaseChange: (contentTypeBase: ContentTypeBase) => void;
  tableColumns: TableColumn<TableDataType>[];
  useTableColumns: (callbackFn: (...args: boolean[]) => string) => string;
  onTableColumnChange: (column: string, visible: boolean) => void;
  selectedRowsPerPage: number;
  onRowsPerPageChange: (option: number) => void;
  sortDirection: SortDirection;
  onSortChange: (column: TableColumn<TableDataType>) => void;
  totalPages: number;
  currentPage: number;
  goToPage: (page: number) => void;
} {
  const triggerUpdate = useRef<boolean>(false);
  const [datasetChanged, setDatasetChanged] = useState<boolean>(false);
  const [searchFieldValue, setSearchFieldValue] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<keyof TableDataType | null>(null);
  const [sortDirection, setSortDirection] =
    useState<SortDirection>(initialSortDirection);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(rowsPerPageOptions[0]);
  const [contentTypeBases, setContentTypeBases] = useState<
    ContentTypeBase[] | null
  >(null);
  const [tableColumns, setTableColumns] = useState<
    TableColumn<TableDataType>[]
  >(
    initialTableColumns.map((column) => ({
      visible: true,
      filter: true,
      ...column,
    }))
  );
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();

  const debouncedSetSearchParams = useDebounce<
    (prev: URLSearchParams) => URLSearchParams
  >(
    (callback) => {
      setSearchParams(callback);
    },
    300,
    []
  );

  const [changesTracker, setChangesTracker] = useState({
    currentPage: false,
    searchQuery: false,
    tableColumns: false,
    sortBy: false,
    sortDirection: false,
    rowsPerPage: false,
    contentTypeBases: false,
  });

  useEffect(() => {
    if (Object.values(changesTracker).filter((change) => change).length === 0) {
      return;
    }

    debouncedSetSearchParams((prevSearchParams) => {
      //Current Page
      if (changesTracker.currentPage) {
        if (typeof currentPage === "number") {
          prevSearchParams.set(
            FilteredTableDataQueryParam.Page,
            currentPage.toString()
          );
        } else prevSearchParams.delete(FilteredTableDataQueryParam.Page);
      }

      //Search query
      if (changesTracker.searchQuery) {
        if (searchQuery)
          prevSearchParams.set(FilteredTableDataQueryParam.Query, searchQuery);
        else prevSearchParams.delete(FilteredTableDataQueryParam.Query);
      }

      //TableColumns - ShowColumn
      if (changesTracker.tableColumns) {
        prevSearchParams.delete(FilteredTableDataQueryParam.ShowColumn);
        tableColumns
          .filter((column) => column.visible)
          .forEach((column) =>
            prevSearchParams.append(
              FilteredTableDataQueryParam.ShowColumn,
              column.id.toString()
            )
          );
      }

      //SortBy + SortDirection
      if (changesTracker.sortBy) {
        prevSearchParams.set(
          FilteredTableDataQueryParam.SortBy,
          sortBy.toString()
        );
      }
      if (changesTracker.sortDirection) {
        prevSearchParams.set(FilteredTableDataQueryParam.Order, sortDirection);
      }

      //Rows per page
      if (changesTracker.rowsPerPage) {
        prevSearchParams.set(
          FilteredTableDataQueryParam.RowsPerPage,
          rowsPerPage.toString()
        );
      }

      //Content type bases
      if (changesTracker.contentTypeBases) {
        prevSearchParams.delete(FilteredTableDataQueryParam.ContentTypeBase);
        contentTypeBases
          .filter((contentTypeBase) => contentTypeBase.visible)
          .forEach((contentTypeBase) =>
            prevSearchParams.append(
              FilteredTableDataQueryParam.ContentTypeBase,
              contentTypeBase.name
            )
          );
      }

      triggerUpdate.current = false;
      setChangesTracker({
        currentPage: false,
        searchQuery: false,
        tableColumns: false,
        sortBy: false,
        sortDirection: false,
        rowsPerPage: false,
        contentTypeBases: false,
      });

      return prevSearchParams;
    });
  }, [
    currentPage,
    searchQuery,
    tableColumns,
    sortBy,
    sortDirection,
    rowsPerPage,
    contentTypeBases,
  ]);

  const useTableColumns = useCallback(
    (callbackFn: (...args: boolean[]) => string) => {
      const columns = tableColumns.map((column) => column.visible);
      return callbackFn(...columns);
    },
    [tableColumns]
  );

  const setPageToStart = useCallback(() => {
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback(
    (page: number) => {
      triggerUpdate.current = false;
      setCurrentPage(page);
      setChangesTracker({
        ...changesTracker,
        currentPage: true,
      });
    },
    [setCurrentPage]
  );

  const handleSearch = useDebounce(
    (value: string) => {
      setChangesTracker({
        ...changesTracker,
        searchQuery: true,
        currentPage: true,
      });
      triggerUpdate.current = false;
      setPageToStart();
      setSearchQuery(value);
    },
    300,
    []
  );

  const onSearchValueChange: React.KeyboardEventHandler<HTMLInputElement> =
    useCallback(
      (event) => {
        event.persist();
        setSearchFieldValue(event.currentTarget.value);
        handleSearch(event.currentTarget.value);
      },
      [handleSearch, setSearchFieldValue]
    );

  const onClearButtonClick: React.MouseEventHandler<HTMLButtonElement> =
    useCallback(
      (event) => {
        event.persist();
        setSearchFieldValue("");
        handleSearch("");
      },
      [handleSearch, setSearchFieldValue]
    );

  const changeColumnVisibility = useCallback(
    (id: string, visible: boolean) => {
      const newTableColumns = tableColumns.slice(0);
      const columnIndex = newTableColumns.findIndex(
        (column) => column.id === id
      );
      newTableColumns[columnIndex].visible = visible;
      if (!visible && newTableColumns[columnIndex].id === sortBy)
        setSortBy(null);
      triggerUpdate.current = false;
      setTableColumns(newTableColumns);
      setChangesTracker({
        ...changesTracker,
        tableColumns: true,
      });
    },
    [tableColumns, setTableColumns, setSortBy, sortBy]
  );

  const onColumnVisiblityChange = useCallback(
    (id: string, visible: boolean) => {
      if (tableColumns.filter((column) => column.visible).length > 1 || visible)
        changeColumnVisibility(id, visible);
    },
    [tableColumns, changeColumnVisibility]
  );

  const handleTableSort = useCallback(
    (column: TableColumn<TableDataType>) => {
      if (!tableColumns.find(({ id }) => id === column.id)) return;
      // If the user isn't switching sort columns, toggle the sort direction
      const sortToggleMap = {
        [SortDirection.Asc]: SortDirection.Desc,
        [SortDirection.Desc]: SortDirection.Asc,
      };
      let newOrder = SortDirection.Asc;

      if (sortBy === column.id) {
        newOrder = sortToggleMap[sortDirection];
      }
      triggerUpdate.current = false;
      setSortBy(column.id as keyof TableDataType);
      setSortDirection(newOrder);
      setPageToStart();
      setChangesTracker({
        ...changesTracker,
        sortBy: true,
        sortDirection: true,
        currentPage: true,
      });
    },
    [
      tableColumns,
      handlePageChange,
      setSortBy,
      setSortDirection,
      sortBy,
      sortDirection,
    ]
  );

  const onRowsPerPageChange = useCallback(
    (option: number) => {
      triggerUpdate.current = false;
      setRowsPerPage(option);
      setPageToStart();
      setChangesTracker({
        ...changesTracker,
        rowsPerPage: true,
        currentPage: true,
      });
    },
    [handlePageChange]
  );

  const onContentTypeBaseChange = useCallback(
    ({ name, visible }: ContentTypeBase) => {
      if (
        contentTypeBases.filter((contentTypeBase) => contentTypeBase.visible)
          .length > 1 ||
        !visible
      ) {
        const newContentTypeBases = contentTypeBases.slice(0);
        const contentTypeBaseIndex = newContentTypeBases.findIndex(
          (contentTypeBase) => contentTypeBase.name === name
        );

        newContentTypeBases[contentTypeBaseIndex].visible = !visible;
        setPageToStart();
        triggerUpdate.current = false;
        setContentTypeBases(newContentTypeBases);
        setChangesTracker({
          ...changesTracker,
          contentTypeBases: true,
          currentPage: true,
        });
      }
    },
    [contentTypeBases, handlePageChange]
  );

  const filteredItems = useMemo(() => {
    return rows.filter((row) => {
      if (
        contentTypeBases &&
        contentTypeBaseColumnId &&
        row[contentTypeBaseColumnId as keyof TableDataType]
      ) {
        const type = row[
          contentTypeBaseColumnId as keyof TableDataType
        ] as unknown;
        const contentTypeBase = contentTypeBases
          .filter((contentTypeBase) => contentTypeBase.visible)
          .find((contentTypeBase) => contentTypeBase.name === type);

        if (!contentTypeBase) return false;
      }

      const parsedSearchValue = searchQuery.toLocaleLowerCase().trim();
      if (!parsedSearchValue) return true;

      if (filterFn) return filterFn(row, searchQuery);

      for (const column in row) {
        const tableColumn = tableColumns.find(({ id }) => id === column);

        if (tableColumn && tableColumn.filter && tableColumn.visible) {
          const value = row[column];

          if (
            value &&
            value
              .toString()
              .toLocaleLowerCase()
              .includes(parsedSearchValue.toLocaleLowerCase())
          )
            return true;
        }
      }

      return false;
    });
  }, [
    contentTypeBases,
    contentTypeBaseColumnId,
    rows,
    tableColumns,
    searchQuery,
    sortCompareFn,
  ]);

  const tableRows = useMemo(
    () =>
      filteredItems.slice(
        (currentPage - 1) * rowsPerPage,
        (currentPage - 1) * rowsPerPage + rowsPerPage
      ),
    [filteredItems, currentPage, rowsPerPage]
  );

  const totalPages = useMemo(
    () => Math.ceil(filteredItems.length / rowsPerPage),
    [filteredItems, rowsPerPage]
  );

  const handleUpdateQueryParams = useCallback(
    (queryParams: URLSearchParams) => {
      if (queryParams.has(FilteredTableDataQueryParam.SortBy)) {
        const param = queryParams.get(
          FilteredTableDataQueryParam.SortBy
        ) as keyof TableDataType;
        if (
          tableColumns
            .filter((column) => column.visible)
            .map((column) => column.id)
            .includes(param)
        )
          setSortBy(param);
      } else {
        setSortBy(null);
      }

      if (queryParams.has(FilteredTableDataQueryParam.Order)) {
        const param = queryParams.get(FilteredTableDataQueryParam.Order);
        if (param === SortDirection.Asc || param === SortDirection.Desc)
          setSortDirection(param);
      } else {
        setSortDirection(initialSortDirection);
      }

      if (queryParams.has(FilteredTableDataQueryParam.Query)) {
        const param = queryParams.get(FilteredTableDataQueryParam.Query);
        const value = decodeURIComponent(param);
        setSearchFieldValue(value);
        setSearchQuery(encodeURIComponent(value));
      } else {
        setSearchFieldValue("");
        setSearchQuery("");
      }

      if (queryParams.has(FilteredTableDataQueryParam.ContentTypeBase)) {
        const contentTypeBasesParams = queryParams.getAll(
          FilteredTableDataQueryParam.ContentTypeBase
        );
        setContentTypeBases((contentTypeBases) => {
          const newContentTypeBases = contentTypeBases
            .slice(0)
            .map((contentTypeBase) => ({
              ...contentTypeBase,
              visible: false,
            }));

          contentTypeBasesParams.forEach((contentTypeBaseParam) => {
            const contentTypeBaseIndex = newContentTypeBases.findIndex(
              (contentTypeBase) => contentTypeBase.name === contentTypeBaseParam
            );
            if (contentTypeBaseIndex > -1) {
              newContentTypeBases[contentTypeBaseIndex].visible = true;
            }
          });

          return newContentTypeBases;
        });
      } else {
        setContentTypeBases(initialContentTypeBases);
      }

      if (queryParams.has(FilteredTableDataQueryParam.ShowColumn)) {
        const columns = queryParams.getAll(
          FilteredTableDataQueryParam.ShowColumn
        );
        setTableColumns((tableColumns) => {
          const newTableColumns = tableColumns.slice(0).map((tableColumn) => ({
            ...tableColumn,
            visible: false,
          }));

          columns.forEach((column) => {
            const tableColumnIndex = newTableColumns.findIndex(
              (tableColumn) => tableColumn.id === column
            );
            if (tableColumnIndex > -1) {
              newTableColumns[tableColumnIndex].visible = true;
            }
          });

          return newTableColumns;
        });
      } else {
        setTableColumns(initialTableColumns);
      }

      if (queryParams.has(FilteredTableDataQueryParam.RowsPerPage)) {
        const param = queryParams.get(FilteredTableDataQueryParam.RowsPerPage);
        const number = parseInt(param);
        if (!Number.isNaN(number) && rowsPerPageOptions.includes(number)) {
          setRowsPerPage(number);
        }
      } else {
        setRowsPerPage(rowsPerPageOptions[0]);
      }

      if (queryParams.has(FilteredTableDataQueryParam.Page)) {
        const param = queryParams.get(FilteredTableDataQueryParam.Page);
        const number = parseInt(param);

        if (!Number.isNaN(number)) {
          setCurrentPage(number);
        }
      } else {
        setPageToStart();
      }
    },
    [
      tableColumns,
      setCurrentPage,
      rowsPerPageOptions,
      setRowsPerPage,
      setTableColumns,
      setContentTypeBases,
      setSearchFieldValue,
      setSearchQuery,
      setSortBy,
      setSortDirection,
      initialSortDirection,
      initialContentTypeBases,
      initialTableColumns,
      rowsPerPageOptions,
    ]
  );

  useEffect(() => {
    if (
      triggerUpdate.current &&
      (currentPage < 0 || currentPage > totalPages)
    ) {
      setPageToStart();
    }
  }, [currentPage]);

  useEffect(() => {
    if (initialContentTypeBases) {
      setContentTypeBases(
        initialContentTypeBases.map((contentTypeBase) => ({
          visible: true,
          ...contentTypeBase,
        }))
      );
    }
    setDatasetChanged(true);
  }, [rows, initialContentTypeBases]);

  useEffect(() => {
    if (datasetChanged && rows.length > 0 && totalPages > 0) {
      setDatasetChanged(false);
      handleUpdateQueryParams(searchParams);
      triggerUpdate.current = true;
    }
  }, [datasetChanged, rows]);

  useEffect(() => {
    if (triggerUpdate.current) {
      handleUpdateQueryParams(searchParams);
    } else {
      triggerUpdate.current = true;
    }
  }, [datasetChanged, location]);

  return {
    rows: tableRows,
    searchValue: searchFieldValue,
    onSearchChange: onSearchValueChange,
    onClearButtonClick,
    contentTypeBases,
    onContentTypeBaseChange,
    tableColumns,
    useTableColumns,
    onTableColumnChange: onColumnVisiblityChange,
    selectedRowsPerPage: rowsPerPage,
    onRowsPerPageChange: onRowsPerPageChange,
    sortDirection,
    onSortChange: handleTableSort,
    totalPages,
    currentPage,
    goToPage: handlePageChange,
  };
}
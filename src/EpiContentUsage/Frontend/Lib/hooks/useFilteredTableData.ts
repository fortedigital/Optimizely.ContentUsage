import { useCallback, useMemo, useState } from "react";
import { ROWS_PER_PAGE_DEFAULT_OPTIONS } from "../../Components/Filters/NumberOfRowsFilter";
import { SortDirection, TableColumn } from "../../types";

export function useFilteredTableData<TableDataType>(
  rows: TableDataType[],
  initialTableColumns: TableColumn<TableDataType>[],
  initialSortDirection = SortDirection.Ascending,
  rowsPerPageOptions = ROWS_PER_PAGE_DEFAULT_OPTIONS,
  sortCompareFn?: (
    prevValue: TableDataType,
    nextValue: TableDataType
  ) => number,
  filterFn?: (row: TableDataType, searchValue: string) => boolean
): {
  rows: TableDataType[];
  searchValue: string;
  onSearchChange: React.KeyboardEventHandler<HTMLInputElement>;
  onClearButtonClick: React.MouseEventHandler<HTMLButtonElement>;
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
  const [searchValue, setSearchValue] = useState<string>("");
  const [sortBy, setSortBy] = useState<keyof TableDataType | null>(null);
  const [sortDirection, setSortDirection] =
    useState<SortDirection>(initialSortDirection);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(rowsPerPageOptions[0]);
  const [tableColumns, setTableColumns] = useState<
    TableColumn<TableDataType>[]
  >(
    initialTableColumns.map((column) => ({
      visible: true,
      filter: true,
      ...column,
    }))
  );

  const useTableColumns = useCallback(
    (callbackFn: (...args: boolean[]) => string) => {
      const columns = tableColumns.map((column) => column.visible);
      return callbackFn(...columns);
    },
    [tableColumns]
  );

  const handleTableSort = useCallback(
    (column: TableColumn<TableDataType>) => {
      if (!tableColumns.find(({ name }) => name === column.name)) return;
      // If the user isn't switching sort columns, toggle the sort direction
      const sortToggleMap = {
        [SortDirection.Ascending]: SortDirection.Descending,
        [SortDirection.Descending]: SortDirection.Ascending,
      };
      let newOrder = SortDirection.Ascending;

      if (sortBy === column.name) {
        newOrder = sortToggleMap[sortDirection];
      }

      setCurrentPage(1);
      setSortBy(column.name as keyof TableDataType);
      setSortDirection(newOrder);
    },
    [setCurrentPage, setSortBy, setSortDirection, sortBy, sortDirection]
  );

  const handleSearch = useCallback(
    (value: string) => {
      setCurrentPage(1);
      setSearchValue(value);
    },
    [setCurrentPage, setSearchValue]
  );

  const onSearchValueChange: React.KeyboardEventHandler<HTMLInputElement> =
    useCallback(
      (event) => {
        event.persist();
        handleSearch(event.currentTarget.value);
      },
      [handleSearch]
    );

  const onClearButtonClick: React.MouseEventHandler<HTMLButtonElement> =
    useCallback(
      (event) => {
        event.persist();
        handleSearch("");
      },
      [handleSearch]
    );

  const changeColumnVisibility = useCallback(
    (name: string, visible: boolean) => {
      const newTableColumns = tableColumns.slice(0);
      const columnIndex = newTableColumns.findIndex(
        (column) => column.name === name
      );
      newTableColumns[columnIndex].visible = visible;
      if (!visible && newTableColumns[columnIndex].name === sortBy)
        setSortBy(null);
      setTableColumns(newTableColumns);
    },
    [tableColumns, setTableColumns, setSortBy, sortBy]
  );

  const onColumnVisiblityChange = useCallback(
    (name: string, visible: boolean) => {
      if (tableColumns.filter((column) => column.visible).length > 1 || visible)
        changeColumnVisibility(name, visible);
      return;
    },
    [tableColumns, changeColumnVisibility]
  );

  const filteredItems = useMemo(() => {
    return rows
      .filter((row) => {
        const parsedSearchValue = searchValue.toLocaleLowerCase().trim();
        if (!parsedSearchValue) return true;

        if (filterFn) return filterFn(row, searchValue);

        for (const column in row) {
          const tableColumn = tableColumns.find(({ name }) => name === column);

          if (tableColumn && tableColumn.filter && tableColumn.visible) {
            const value = row[column];
            if (
              typeof value === "string" &&
              value
                .toLocaleLowerCase()
                .includes(parsedSearchValue.toLocaleLowerCase())
            )
              return true;

            if (
              typeof value === "number" &&
              parseInt(parsedSearchValue) === value
            )
              return true;
          }
        }

        return false;
      })
      .sort((prevValue, nextValue) => {
        if (!sortBy) return 0;

        if (sortCompareFn) return sortCompareFn(prevValue, nextValue);

        if (!prevValue[sortBy]) return 1;

        if (sortDirection === SortDirection.Descending)
          return prevValue[sortBy] > nextValue[sortBy] ? -1 : 1;
        else if (sortDirection === SortDirection.Ascending)
          return prevValue[sortBy] > nextValue[sortBy] ? 1 : -1;
        else return 0;
      });
  }, [rows, tableColumns, sortDirection, sortBy, searchValue, sortCompareFn]);

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

  return {
    rows: tableRows,
    searchValue,
    onSearchChange: onSearchValueChange,
    onClearButtonClick,
    tableColumns,
    useTableColumns,
    onTableColumnChange: onColumnVisiblityChange,
    selectedRowsPerPage: rowsPerPage,
    onRowsPerPageChange: setRowsPerPage,
    sortDirection,
    onSortChange: handleTableSort,
    totalPages,
    currentPage,
    goToPage: setCurrentPage,
  };
}

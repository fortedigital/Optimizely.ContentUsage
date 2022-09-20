import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ContentArea,
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableColumnHeaderCell,
  DataTableColumnManageButton,
  DataTableContent,
  DataTableHeaderRow,
  DataTablePagination,
  DataTableRow,
  DataTableToolbar,
  Search,
  SortDirection,
  Typography,
  Workspace,
} from "@episerver/ui-framework";
import { ContentType, TableColumn } from "../types";
import { useDataLoading } from "../Lib/hooks/useDataLoading";

const ROWS_PER_PAGE_OPTIONS = [10, 20, 30];

const ContentTypesView = ({ endpointUrl }: { endpointUrl: string }) => {
  const [contentTypes, setContentTypes] = useState<ContentType[]>([]);
  const [searchValue, setSearchValue] = useState<string>("");
  const [sortBy, setSortBy] = useState<TableColumn | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(0);
  const [startRow, setStartRow] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(
    ROWS_PER_PAGE_OPTIONS[0]
  );
  const [tableColumns, setTableColumns] = useState([
    { name: "guid", value: "GUID", width: "auto", show: false },
    { name: "name", value: "Name", width: "auto", show: false },
    { name: "displayName", value: "Display name", width: "55%", show: true },
    { name: "type", value: "Type", width: "30%", show: true },
    { name: "usageCount", value: "Usage count", width: "15%", show: true },
  ]);

  const [loaded, response] = useDataLoading<ContentType[]>(endpointUrl);

  useEffect(() => {
    if (loaded) setContentTypes(response.data);
  }, [loaded, response]);

  const onTableSort = useCallback(
    (column: TableColumn, direction: SortDirection) => {
      setStartRow(0);
      setSortBy(column);
      setSortDirection(direction);
    },
    [setStartRow, setSortBy, setSortDirection]
  );

  const onTableSearch = useCallback(
    (value: string) => {
      setStartRow(0);
      setSearchValue(value);
    },
    [setStartRow, setSearchValue]
  );

  const changeColumnVisibility = useCallback(
    (displayName: string, show: boolean) => {
      const newTableColumns = tableColumns.slice(0);
      const columnIndex = newTableColumns.findIndex(
        (column) => column.value === displayName
      );
      newTableColumns[columnIndex].show = show;
      if (!show && newTableColumns[columnIndex].name === sortBy)
        setSortBy(null);
      setTableColumns(newTableColumns);
    },
    [tableColumns, setTableColumns, setSortBy, sortBy]
  );

  const onTableColumnManageSelectChange = useCallback(
    (column: string, checked: boolean) =>
      changeColumnVisibility(column, checked),
    [changeColumnVisibility]
  );

  const visibleColumns = tableColumns.map((column) => ({
    name: column.value,
    visible: column.show,
  }));

  const filteredItems = useMemo(() => {
    return contentTypes
      .slice(0)
      .filter((value) => {
        if (!searchValue) return true;

        if (
          value.displayName
            ?.toLocaleLowerCase()
            .includes(searchValue.toLocaleLowerCase())
        )
          return true;
        if (
          value.name
            ?.toLocaleLowerCase()
            .includes(searchValue.toLocaleLowerCase())
        )
          return true;
        if (
          value.type
            ?.toLocaleLowerCase()
            .includes(searchValue.toLocaleLowerCase())
        )
          return true;
        if (parseInt(searchValue) && value.usageCount === parseInt(searchValue))
          return true;
        if (value.guid.includes(searchValue)) return true;

        return false;
      })
      .sort((prevValue, nextValue) => {
        if (!sortBy) return 0;
        const sortField =
          sortBy === "displayName" && !prevValue[sortBy] ? "name" : sortBy;
        if (sortDirection === 1)
          return prevValue[sortField] > nextValue[sortField] ? -1 : 1;
        else if (sortDirection === 2)
          return prevValue[sortField] > nextValue[sortField] ? 1 : -1;
        else return 0;
      });
  }, [contentTypes, sortDirection, sortBy, searchValue]);

  const tableItems = useMemo(
    () => filteredItems.slice(startRow, startRow + rowsPerPage),
    [filteredItems, startRow, rowsPerPage]
  );

  return loaded ? (
    <div className="content-area-container">
      <ContentArea>
        <Workspace>
          <div className="epi-main-header">
            <Typography tag="h2" use="headline4">
              Content Usage
            </Typography>
          </div>

          <DataTable>
            <DataTableToolbar>
              <Search
                value={searchValue}
                onValueChange={onTableSearch}
                onSearch={onTableSearch}
              />
            </DataTableToolbar>
            <DataTableContent>
              <DataTableHeaderRow>
                <>
                  {tableColumns
                    .filter((column) => column.show)
                    .map(({ name, value, width }) => (
                      <DataTableColumnHeaderCell
                        key={name}
                        sortDirection={sortBy === name && sortDirection}
                        onSort={(_, sortDirection) =>
                          onTableSort(name as TableColumn, sortDirection)
                        }
                        style={{ width: width }}
                      >
                        {value}
                      </DataTableColumnHeaderCell>
                    ))}

                  <DataTableColumnManageButton
                    columns={visibleColumns}
                    onSelectChange={onTableColumnManageSelectChange}
                  />
                </>
              </DataTableHeaderRow>
              <DataTableBody>
                {tableItems.length > 0 ? (
                  tableItems.map(
                    ({ guid, name, displayName, type, usageCount }) => (
                      <DataTableRow key={guid} rowId={guid} onClick={() => {}}>
                        {tableColumns
                          .filter((column) => column.show)
                          .map((column) => (
                            <DataTableCell key={column.name}>
                              <>
                                {column.name === "guid" ? guid : ""}
                                {column.name === "name" ? name : ""}
                                {column.name === "displayName"
                                  ? displayName || name
                                  : ""}
                                {column.name === "type" ? type : ""}
                                {column.name === "usageCount" ? usageCount : ""}
                              </>
                            </DataTableCell>
                          ))}
                      </DataTableRow>
                    )
                  )
                ) : (
                  <DataTableRow rowId="noResults">
                    <DataTableCell>No matching results</DataTableCell>
                  </DataTableRow>
                )}
              </DataTableBody>
            </DataTableContent>
            <DataTablePagination
              startRow={startRow}
              totalRowCount={filteredItems.length}
              rowsPerPage={rowsPerPage}
              rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
              onChangePage={(startRow) => setStartRow(startRow)}
              onChangeRowsPerPage={(rowsPerPage) => setRowsPerPage(rowsPerPage)}
            />
          </DataTable>
        </Workspace>
      </ContentArea>
    </div>
  ) : null;
};

export default ContentTypesView;

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ContentType, SortDirection } from "../types";
import {
  Button,
  Dropdown,
  Grid,
  GridCell,
  GridContainer,
  Input,
  PaginationControls,
  Table,
  Typography,
} from "optimizely-oui";
import { Link, useLoaderData, useNavigate } from "react-router-dom";
import { AxiosResponse } from "axios";
import Layout from "../Components/Layout";
import { viewContentTypeUsages } from "../routes";

type TableColumn = "guid" | "name" | "displayName" | "type" | "usageCount";

const ROWS_PER_PAGE_OPTIONS = [15, 30, 60];

const ContentTypesView = () => {
  const [contentTypes, setContentTypes] = useState<ContentType[]>([]);
  const [searchValue, setSearchValue] = useState<string>("");
  const [sortBy, setSortBy] = useState<TableColumn | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(
    SortDirection.Ascending
  );
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(
    ROWS_PER_PAGE_OPTIONS[0]
  );
  const [tableColumns, setTableColumns] = useState([
    { name: "guid", value: "GUID", show: false },
    { name: "displayName", value: "Display name", show: true },
    { name: "name", value: "Name", show: true },
    { name: "type", value: "Type", show: true },
    { name: "usageCount", value: "Usage count", show: true },
  ]);
  const navigate = useNavigate();

  type TableColumnWidthCallbackFunction = (
    guid: boolean,
    displayName: boolean,
    name: boolean,
    type: boolean,
    usageCount: boolean
  ) => string;

  const tableColumnWidth = useCallback(
    (callbackFn: TableColumnWidthCallbackFunction) => {
      const columns = tableColumns.map((column) => column.show);
      const [guid, displayName, name, type, usageCount] = columns;
      return callbackFn(guid, displayName, name, type, usageCount);
    },
    [tableColumns]
  );

  const tableColumnsWidthMap = useMemo(
    () =>
      new Map([
        [
          "guid",
          tableColumnWidth((guid, displayName, name, type, usageCount) => {
            if (!displayName && !name) return "auto";
            return "320px";
          }),
        ],
        [
          "displayName",
          tableColumnWidth((guid, displayName, name, type, usageCount) => {
            if (!guid) return "auto";
            return "200px";
          }),
        ],
        ["name", "auto"],
        [
          "type",
          tableColumnWidth((guid, displayName, name, type, usageCount) => {
            if (!guid || !displayName) return "auto";
            return "150px";
          }),
        ],
        [
          "usageCount",
          tableColumnWidth((guid, displayName, name, type, usageCount) => {
            if (!guid || !displayName) return "auto";
            return "120px";
          }),
        ],
        [
          "actions",
          tableColumnWidth((guid, displayName, name, type, usageCount) => {
            return "100px";
          }),
        ],
      ]),
    [tableColumnWidth]
  );

  const handleTableSort = useCallback(
    (column: TableColumn) => {
      // If the user isn't switching sort columns, toggle the sort direction
      const sortToggleMap = {
        [SortDirection.Ascending]: SortDirection.Descending,
        [SortDirection.Descending]: SortDirection.Ascending,
      };
      let newOrder = SortDirection.Ascending;

      if (sortBy === column) {
        newOrder = sortToggleMap[sortDirection];
      }

      setCurrentPage(1);
      setSortBy(column);
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
    useCallback((event) => {
      event.persist();
      handleSearch(event.currentTarget.value);
    }, []);

  const changeColumnVisibility = useCallback(
    (name: string, show: boolean) => {
      const newTableColumns = tableColumns.slice(0);
      const columnIndex = newTableColumns.findIndex(
        (column) => column.name === name
      );
      newTableColumns[columnIndex].show = show;
      if (!show && newTableColumns[columnIndex].name === sortBy)
        setSortBy(null);
      setTableColumns(newTableColumns);
    },
    [tableColumns, setTableColumns, setSortBy, sortBy]
  );

  const onColumnVisiblityChange = useCallback(
    (name: string, show: boolean) => {
      if (tableColumns.filter((column) => column.show).length > 1 || show)
        changeColumnVisibility(name, show);
      return;
    },
    [tableColumns, changeColumnVisibility]
  );

  const filteredItems = useMemo(() => {
    return contentTypes
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
        if (sortDirection === SortDirection.Descending)
          return prevValue[sortField] > nextValue[sortField] ? -1 : 1;
        else if (sortDirection === SortDirection.Ascending)
          return prevValue[sortField] > nextValue[sortField] ? 1 : -1;
        else return 0;
      });
  }, [contentTypes, sortDirection, sortBy, searchValue]);

  const tableItems = useMemo(
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

  const onTableRowClick = useCallback(
    (guid: string, displayName: string) =>
      navigate(viewContentTypeUsages(guid), {
        state: { contentType: { displayName: displayName } },
      }),
    [navigate]
  );

  const response = useLoaderData() as AxiosResponse<ContentType[], any>;
  useEffect(() => {
    if (response && response.data) setContentTypes(response.data);
  }, [response]);

  return (
    <Layout>
      <GridContainer className="content-usage-list">
        <Grid>
          <GridCell large={12} medium={8} small={4}>
            <div className="epi-main-header">
              <Typography type="header4" tag="h2">
                Content Usage
              </Typography>
            </div>
          </GridCell>

          <GridCell
            large={8}
            medium={6}
            small={2}
            className="content-usage-list-filters"
          >
            <Input
              displayError={false}
              hasClearButton={searchValue.length !== 0}
              hasSpellCheck={false}
              isFilter={false}
              isRequired={false}
              leftIconName="search"
              onChange={onSearchValueChange}
              onClearButtonClick={() => handleSearch("")}
              placeholder="Search"
              type="text"
              value={searchValue}
            />

            <Dropdown
              arrowIcon="down"
              buttonContent={{
                label: `Show columns`,
                content:
                  tableColumns.filter((column) => !column.show).length === 0
                    ? `All`
                    : `Mixed`,
              }}
              style="plain"
              shouldHideChildrenOnClick={false}
            >
              <Dropdown.Contents>
                {tableColumns.map(({ name, value, show }) => (
                  <Dropdown.ListItem key={name}>
                    <Dropdown.BlockLink
                      isItemSelected={show}
                      isMultiSelect={true}
                      onClick={() => onColumnVisiblityChange(name, !show)}
                    >
                      <Dropdown.BlockLinkText text={value} />
                    </Dropdown.BlockLink>
                  </Dropdown.ListItem>
                ))}
              </Dropdown.Contents>
            </Dropdown>

            <Dropdown
              arrowIcon="down"
              buttonContent={{
                label: `Row count`,
                content: rowsPerPage.toString(),
              }}
              style="plain"
            >
              <Dropdown.Contents>
                {ROWS_PER_PAGE_OPTIONS.map((option) => (
                  <Dropdown.ListItem key={option}>
                    <Dropdown.BlockLink onClick={() => setRowsPerPage(option)}>
                      <Dropdown.BlockLinkText
                        isItemSelected={option === rowsPerPage}
                        text={option}
                      />
                    </Dropdown.BlockLink>
                  </Dropdown.ListItem>
                ))}
              </Dropdown.Contents>
            </Dropdown>
          </GridCell>

          <GridCell large={12}>
            <Table
              className="content-usage-table"
              shouldAddHover={tableItems.length > 0}
            >
              <Table.THead>
                <Table.TR>
                  {tableColumns
                    .filter((column) => column.show)
                    .map(({ name, value }) => (
                      <Table.TH
                        width={tableColumnsWidthMap.get(name)}
                        sorting={{
                          canSort: true,
                          handleSort: () =>
                            handleTableSort(name as TableColumn),
                          order: sortDirection,
                        }}
                        key={name}
                      >
                        {value}
                      </Table.TH>
                    ))}
                  <Table.TH
                    width={tableColumnsWidthMap.get("actions")}
                  ></Table.TH>
                </Table.TR>
              </Table.THead>

              <Table.TBody>
                {tableItems.length > 0 ? (
                  tableItems.map(
                    ({ guid, name, displayName, type, usageCount }) => (
                      <Table.TR
                        key={guid}
                        onRowClick={() => onTableRowClick(guid, displayName)}
                      >
                        {tableColumns
                          .filter((column) => column.show)
                          .map((column) => (
                            <Table.TD key={column.name}>
                              <>
                                {column.name === "guid" ? guid : ""}
                                {column.name === "name" ? name : ""}
                                {column.name === "displayName"
                                  ? displayName || name
                                  : ""}
                                {column.name === "type" ? type : ""}
                                {column.name === "usageCount" ? usageCount : ""}
                              </>
                            </Table.TD>
                          ))}
                        <Table.TD>
                          <Link to={viewContentTypeUsages(guid)}>
                            <Button size="small" width="default" isLink>
                              View usages
                            </Button>
                          </Link>
                        </Table.TD>
                      </Table.TR>
                    )
                  )
                ) : (
                  <Table.TR noHover>
                    <Table.TD colSpan={6}>No matching results</Table.TD>
                  </Table.TR>
                )}
              </Table.TBody>
            </Table>
          </GridCell>

          {filteredItems.length > rowsPerPage && (
            <GridCell large={12} medium={8} small={4}>
              <PaginationControls
                currentPage={currentPage}
                goToPage={(page: number) => setCurrentPage(page)}
                totalPages={totalPages}
              />
            </GridCell>
          )}
        </Grid>
      </GridContainer>
    </Layout>
  );
};

export default ContentTypesView;

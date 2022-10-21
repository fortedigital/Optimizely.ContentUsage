import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Breadcrumb } from "@episerver/ui-framework";
import { ContentType, ContentTypeUsage, SortDirection } from "../types";
import {
  Button,
  Dropdown,
  Grid,
  GridCell,
  GridContainer,
  Input,
  Link,
  PaginationControls,
  Table,
  Typography,
} from "optimizely-oui";
import { useLoaderData, useLocation } from "react-router-dom";
import { AxiosResponse } from "axios";
import Layout from "../Components/Layout";
import { getRoutePath, viewContentTypes } from "../routes";

type TableColumn = "guid" | "id" | "name" | "languageBrach" | "pageUrl";

const ROWS_PER_PAGE_OPTIONS = [15, 30, 60];

const ContentTypeUsageView = () => {
  const [contentTypeDisplayName, setContentTypeDisplayName] =
    useState<string>();
  const [contentTypeUsages, setContentTypeUsages] = useState<
    ContentTypeUsage[]
  >([]);
  const [searchValue, setSearchValue] = useState<string>("");
  const [sortBy, setSortBy] = useState<TableColumn | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(
    SortDirection.Ascending
  );
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(
    ROWS_PER_PAGE_OPTIONS[0]
  );
  const location = useLocation();

  const [tableColumns, setTableColumns] = useState([
    { name: "id", value: "ID", show: true, width: "60px" },
    { name: "guid", value: "GUID", show: true, width: "320px" },
    { name: "name", value: "Name", show: true },
    { name: "languageBrach", value: "Language", show: true, width: "100px" },
    { name: "pageUrl", value: "URL", show: true },
  ]);

  type TableColumnWidthCallbackFunction = (
    id: boolean,
    guid: boolean,
    name: boolean,
    languageBrach: boolean,
    pageUrl: boolean
  ) => string;

  const tableColumnWidth = useCallback(
    (callbackFn: TableColumnWidthCallbackFunction) => {
      const columns = tableColumns.map((column) => column.show);
      const [id, guid, name, languageBrach, pageUrl] = columns;
      return callbackFn(id, guid, name, languageBrach, pageUrl);
    },
    [tableColumns]
  );

  const tableColumnsWidthMap = useMemo(
    () =>
      new Map([
        [
          "id",
          tableColumnWidth((id, guid, name, languageBrach, pageUrl) => {
            if (!guid && !name && !languageBrach && !pageUrl) return "auto";
            return "60px";
          }),
        ],
        [
          "guid",
          tableColumnWidth((id, guid, name, languageBrach, pageUrl) => {
            if (!name && !pageUrl) return "auto";
            return "320px";
          }),
        ],
        ["name", "auto"],
        [
          "languageBrach",
          tableColumnWidth((id, guid, name, languageBrach, pageUrl) => {
            if (!guid && !pageUrl) return "auto";
            return "100px";
          }),
        ],
        [
          "pageUrl",
          tableColumnWidth((id, guid, name, languageBrach, pageUrl) => {
            if (!guid) return "auto";
            return "340px";
          }),
        ],
        [
          "actions",
          tableColumnWidth((id, guid, name, languageBrach, pageUrl) => {
            return "60px";
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
      // @ts-ignore
      handleSearch(event.target.value);
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
    return contentTypeUsages
      .filter((value) => {
        if (!searchValue) return true;

        if (parseInt(searchValue) && value.id === parseInt(searchValue))
          return true;
        if (
          value.name
            ?.toLocaleLowerCase()
            .includes(searchValue.toLocaleLowerCase())
        )
          return true;
        if (
          value.languageBrach
            ?.toLocaleLowerCase()
            .includes(searchValue.toLocaleLowerCase())
        )
          return true;
        if (value.pageUrls.length > 0)
          value.pageUrls.forEach((pageUrl) => {
            if (
              pageUrl
                .toLocaleLowerCase()
                .includes(searchValue.toLocaleLowerCase())
            )
              return true;
          });
        if (value.contentTypeGuid.includes(searchValue)) return true;

        return false;
      })
      .sort((prevValue, nextValue) => {
        if (!sortBy) return 0;
        const sortField = sortBy as keyof ContentTypeUsage;
        if (sortDirection === SortDirection.Descending)
          return prevValue[sortField] > nextValue[sortField] ? -1 : 1;
        else if (sortDirection === SortDirection.Ascending)
          return prevValue[sortField] > nextValue[sortField] ? 1 : -1;
        else return 0;
      });
  }, [contentTypeUsages, sortDirection, sortBy, searchValue]);

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
    (editUrl: string) => window.location.assign(editUrl),
    []
  );

  const response = useLoaderData() as
    | AxiosResponse<ContentTypeUsage[]>
    | [AxiosResponse<ContentType>, AxiosResponse<ContentTypeUsage[]>];
  useEffect(() => {
    if (response) {
      if (Array.isArray(response)) {
        const [contentTypeResponse, contentTypeUsagesResponse] = response;
        if (contentTypeUsagesResponse.data)
          setContentTypeUsages(contentTypeUsagesResponse.data);
        if (contentTypeResponse.data)
          setContentTypeDisplayName(contentTypeResponse.data.displayName);
      } else if (response.data) {
        setContentTypeDisplayName(location.state?.contentType?.displayName);
        setContentTypeUsages(response.data);
      }
    }
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
          <GridCell large={12} medium={8} small={4}>
            {contentTypeDisplayName ? (
              <Breadcrumb
                items={[
                  {
                    title: `Content Usage`,
                    link: getRoutePath(viewContentTypes()),
                    level: 1,
                  },
                  {
                    title: contentTypeDisplayName,
                    link: getRoutePath(location.pathname),
                    level: 2,
                    active: true,
                  },
                ]}
              />
            ) : null}
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
                    .map(({ name, value, width }) => (
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
                    width={tableColumnsWidthMap.get(`actions`)}
                  ></Table.TH>
                </Table.TR>
              </Table.THead>

              <Table.TBody>
                {tableItems.length > 0 ? (
                  tableItems.map(
                    ({
                      id,
                      contentTypeGuid,
                      name,
                      languageBrach,
                      pageUrls,
                      editUrl,
                    }) => (
                      <Table.TR
                        onRowClick={() => onTableRowClick(editUrl)}
                        key={id}
                      >
                        {tableColumns
                          .filter((column) => column.show)
                          .map((column) => (
                            <Table.TD key={column.name}>
                              <>
                                {column.name === "id" ? id : ""}
                                {column.name === "guid" ? contentTypeGuid : ""}
                                {column.name === "name" ? name : ""}
                                {column.name === "languageBrach"
                                  ? languageBrach
                                  : ""}
                                {column.name === "pageUrl" &&
                                pageUrls.length > 0 &&
                                pageUrls[0] ? (
                                  <Link href={pageUrls[0]} newWindow>
                                    {pageUrls[0]}
                                  </Link>
                                ) : (
                                  ""
                                )}
                              </>
                            </Table.TD>
                          ))}
                        <Table.TD>
                          <Link href={editUrl}>
                            <Button size="small" width="default" isLink>
                              Edit
                            </Button>
                          </Link>
                        </Table.TD>
                      </Table.TR>
                    )
                  )
                ) : (
                  <Table.TR noHover>
                    <Table.TD colSpan={5}>No matching results</Table.TD>
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

export default ContentTypeUsageView;

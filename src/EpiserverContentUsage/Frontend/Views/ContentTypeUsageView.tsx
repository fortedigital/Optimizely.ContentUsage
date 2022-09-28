import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Breadcrumb,
  ContentArea,
  Icon,
  Workspace,
} from "@episerver/ui-framework";
import { ContentTypeUsage, SortDirection } from "../types";
import { useDataLoading } from "../Lib/hooks/useDataLoading";
import {
  Button,
  Dropdown,
  Grid,
  GridCell,
  GridContainer,
  Input,
  Link,
  PaginationControls,
  Spinner,
  Table,
  Typography,
} from "optimizely-oui";
import { RouterContext } from "../router-context";

type TableColumn = "guid" | "id" | "name" | "languageBrach" | "pageUrl";

const ROWS_PER_PAGE_OPTIONS = [15, 30, 60];

interface ContentTypeUsageViewProps {
  endpointUrl: string;
  guid: string;
  contentTypeName: string;
}

const ContentTypeUsageView = ({
  endpointUrl,
  guid,
  contentTypeName,
}: ContentTypeUsageViewProps) => {
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

  const { goBack } = useContext(RouterContext);

  const [loaded, response] = useDataLoading<ContentTypeUsage[]>(endpointUrl, {
    guid: guid,
  });

  useEffect(() => {
    if (loaded) setContentTypeUsages(response.data);
  }, [loaded, response]);

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

  return (
    <div className="content-area-container">
      <ContentArea>
        <Workspace>
          <GridContainer className="content-types-list">
            <Grid>
              <GridCell large={12} medium={8} small={4}>
                <div className="epi-main-header">
                  <Typography type="header4" tag="h2">
                    Content Usage
                  </Typography>
                </div>
              </GridCell>
              <GridCell large={12} medium={8} small={4}>
                <Breadcrumb
                  items={[
                    { title: `Content Usage`, link: ``, level: 1 },
                    {
                      title: contentTypeName,
                      link: ``,
                      level: 2,
                      active: true,
                    },
                  ]}
                />
              </GridCell>

              <GridCell
                large={8}
                medium={6}
                small={2}
                className="content-types-list-filters"
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
                  isDisabled={!loaded}
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
                  isDisabled={!loaded}
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
                  isDisabled={!loaded}
                  style="plain"
                >
                  <Dropdown.Contents>
                    {ROWS_PER_PAGE_OPTIONS.map((option) => (
                      <Dropdown.ListItem key={option}>
                        <Dropdown.BlockLink
                          onClick={() => setRowsPerPage(option)}
                        >
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
                  className="content-types-list-table"
                  shouldAddHover={false}
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
                          <Table.TR key={contentTypeGuid}>
                            {tableColumns
                              .filter((column) => column.show)
                              .map((column) => (
                                <Table.TD key={column.name}>
                                  <>
                                    {column.name === "id" ? id : ""}
                                    {column.name === "guid" ? guid : ""}
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
                    ) : loaded ? (
                      <Table.TR noHover>
                        <Table.TD colSpan={5}>No matching results</Table.TD>
                      </Table.TR>
                    ) : (
                      <Table.TR noHover>
                        <Table.TD colSpan={5} textAlign="center">
                          <Spinner />
                        </Table.TD>
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
                    isLoading={!loaded}
                    totalPages={totalPages}
                  />
                </GridCell>
              )}
            </Grid>
          </GridContainer>
        </Workspace>
      </ContentArea>
    </div>
  );
};

export default ContentTypeUsageView;

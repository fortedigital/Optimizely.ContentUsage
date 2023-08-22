import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Breadcrumb } from "@episerver/ui-framework";
import { TableColumn } from "../types";
import {
  ButtonIcon,
  DiscloseTable,
  Dropdown,
  Grid,
  GridCell,
  GridContainer,
  Link,
  PaginationControls,
  Spinner,
  Table,
} from "optimizely-oui";
import { useLoaderData, useLocation } from "react-router-dom";
import Layout from "../Components/Layout";
import { getRoutePath, navigateTo, viewContentTypes } from "../routes";
import {
  ContentTypeDto,
  ContentUsageDto,
  GetContentUsagesResponse,
} from "../dtos";
import { useFilteredTableData } from "../Lib/hooks/useFilteredTableData";
import { APIResponse } from "../Lib/ContentUsageAPIClient";
import Header from "../Components/Header";
import { useTranslations } from "../Contexts/TranslationsProvider";
import Filters from "../Components/Filters/Filters";
import { useScroll } from "../Lib/hooks/useScroll";

import "./ContentTypeUsageView.scss";

enum ContentTypeUsageTableColumn {
  ID = "id",
  Name = "name",
  LanguageBranch = "languageBranch",
  PageUrl = "pageUrl",
  Actions = "actions",
}

interface ContentTypeUsageTableRowProps<TableDataType> extends ContentUsageDto {
  tableColumns: TableColumn<TableDataType>[];
  onRowClick?: (event: React.PointerEvent) => void;
  onEditButtonClick?: (event: React.PointerEvent) => void;
  onViewWebsiteClick?: () => void;
  hasDiscloseTableRows?: boolean;
}

type ContentTypeUsageViewResponse =
  | APIResponse<GetContentUsagesResponse>
  | ContentTypeUsageViewInitialResponse;

type ContentTypeUsageViewInitialResponse = [
  APIResponse<ContentTypeDto>,
  APIResponse<GetContentUsagesResponse>
];

const ContentTypeUsageDiscloseTableRow = ({
  tableColumns,
  onRowClick,
  ...row
}: ContentTypeUsageTableRowProps<ContentUsageDto>) => {
  const {
    views: {
      contentUsagesView: {
        table: { actions },
      },
    },
  } = useTranslations();

  return (
    <DiscloseTable.Row
      rowContents={[
        ...tableColumns
          .filter((column) => column.visible)
          .map((column) => (
            <Table.TD key={column.id}>
              {column.id.toString() === ContentTypeUsageTableColumn.PageUrl
                ? null
                : row[column.id]}
            </Table.TD>
          )),
        <Table.TD key={ContentTypeUsageTableColumn.Actions} />,
      ]}
      isFullWidth
      key={row.id}
    >
      <div className="flex soft-double--sides">
        <div className="forte-optimizely-content-usage-table-container">
          <Table>
            <Table.THead>
              <Table.TR>
                <Table.TH>URL</Table.TH>
              </Table.TR>
            </Table.THead>
            <Table.TBody>
              {row.pageUrls.length > 0 &&
                row.pageUrls.map((pageUrl, index) => (
                  <Table.TR key={index}>
                    <Link key={index} href={pageUrl} newWindow>
                      {pageUrl}
                    </Link>
                  </Table.TR>
                ))}
            </Table.TBody>
          </Table>
        </div>
      </div>
    </DiscloseTable.Row>
  );
};

const ContentTypeUsageTableRow = ({
  tableColumns,
  onRowClick,
  onEditButtonClick,
  onViewWebsiteClick,
  hasDiscloseTableRows,
  ...row
}: ContentTypeUsageTableRowProps<ContentUsageDto>) => {
  const {
    views: {
      contentUsagesView: {
        table: { actions },
      },
    },
  } = useTranslations();

  return (
    <Table.TR onRowClick={onRowClick}>
      {hasDiscloseTableRows && <Table.TD />}
      {tableColumns
        .filter((column) => column.visible)
        .map((column) => (
          <Table.TD key={column.id}>
            {column.id.toString() === ContentTypeUsageTableColumn.PageUrl &&
            row.pageUrls.length > 0 &&
            row.pageUrls[0] ? (
              <Link href={row.pageUrls[0]} newWindow>
                {row.pageUrls[0]}
              </Link>
            ) : (
              row[column.id]
            )}
          </Table.TD>
        ))}
      <Table.TD>
        <Dropdown
          activator={
            <ButtonIcon
              iconName="ellipsis"
              size="small"
              style="plain"
              title={actions.title}
            />
          }
        >
          <Dropdown.Contents>
            {row.pageUrls[0] && (
              <Dropdown.ListItem onClick={onViewWebsiteClick}>
                <Dropdown.BlockLink>
                  <Dropdown.BlockLinkText text={actions.view} />
                </Dropdown.BlockLink>
              </Dropdown.ListItem>
            )}
            <Dropdown.ListItem onClick={onEditButtonClick}>
              <Dropdown.BlockLink>
                <Dropdown.BlockLinkText text={actions.edit} />
              </Dropdown.BlockLink>
            </Dropdown.ListItem>
          </Dropdown.Contents>
        </Dropdown>
      </Table.TD>
    </Table.TR>
  );
};

const ContentTypeUsageView = () => {
  const [dataLoaded, setDataLoaded] = useState<boolean>(false);
  const translations = useTranslations();
  const [contentTypeDisplayName, setContentTypeDisplayName] =
    useState<string>();
  const [contentTypeUsages, setContentTypeUsages] = useState<ContentUsageDto[]>(
    []
  );
  const location = useLocation();
  const gridContainerRef = useRef<HTMLElement | null>();
  const { scrollTo } = useScroll();

  const {
    views: {
      contentUsagesView: {
        table: { columns },
      },
    },
  } = translations;

  const initialTableColumns = [
    {
      id: ContentTypeUsageTableColumn.ID,
      name: columns.id,
      visible: true,
      filter: true,
      sorting: true,
    },
    {
      id: ContentTypeUsageTableColumn.Name,
      name: columns.name,
      visible: true,
      filter: true,
      sorting: true,
    },
    {
      id: ContentTypeUsageTableColumn.LanguageBranch,
      name: columns.languageBranch,
      visible: true,
      filter: true,
      sorting: true,
    },
    {
      id: ContentTypeUsageTableColumn.PageUrl,
      name: columns.pageUrl,
      visible: true,
      sorting: false,
    },
  ] as TableColumn<ContentUsageDto>[];

  const {
    rows,
    searchValue,
    onSearchChange,
    onClearButtonClick,
    tableColumns,
    onTableColumnChange,
    sortDirection,
    onSortChange,
    currentPage,
    goToPage,
  } = useFilteredTableData({
    rows: contentTypeUsages,
    initialTableColumns,
    disableFrontendFiltering: true,
    disableFrontendPagination: true,
    disableFrontendSorting: true,
    defaultVisiableColumn: "name"
  });

  const [totalPages, setTotalPages] = useState<number>();

  const handlePageChange = useCallback(
    (page: number) => {
      goToPage(page);
      setDataLoaded(false);
      scrollTo(gridContainerRef.current);
    },
    [goToPage]
  );

  const breadcrumbItems = useMemo(
    () => [
      {
        title: translations.title,
        link: getRoutePath(viewContentTypes()),
        level: 1,
      },
      {
        title: contentTypeDisplayName,
        link: getRoutePath(location.pathname),
        level: 2,
        active: true,
      },
    ],
    [translations, contentTypeDisplayName]
  );

  const onTableRowClick = useCallback(
    (url?: string | null, alwaysTriggerClick = false) =>
      (event: React.PointerEvent) => {
        if (!url) return;

        const target = event.target as HTMLTableCellElement | undefined;

        if ((target && target.tagName === "TD") || alwaysTriggerClick) {
          navigateTo(url);
        }
      },
    [navigateTo]
  );

  const onViewWebsiteClick = useCallback(
    (url?: string | null) => () => {
      if (!url) return;

      navigateTo(url);
    },
    [navigateTo]
  );

  const hasDiscloseTableRows = useMemo(
    () => rows.some((row) => row.pageUrls.length > 1),
    [rows]
  );

  const response = useLoaderData() as ContentTypeUsageViewResponse;

  const setDataFromInitialResponse = useCallback(
    (response: ContentTypeUsageViewInitialResponse) => {
      const [contentTypeResponse, contentTypeUsagesResponse] = response;

      if (
        contentTypeUsagesResponse.data &&
        !contentTypeUsagesResponse.hasErrors
      ) {
        setContentTypeUsages(contentTypeUsagesResponse.data.contentUsages);
        setTotalPages(contentTypeUsagesResponse.data.totalPages);
      }

      if (contentTypeResponse.data && !contentTypeResponse.hasErrors)
        setContentTypeDisplayName(
          contentTypeResponse.data.displayName || contentTypeResponse.data.name
        );
    },
    []
  );

  useEffect(() => {
    if (response) {
      if (Array.isArray(response)) {
        setDataFromInitialResponse(response);
      } else if (response.data && !response.hasErrors) {
        setContentTypeUsages(response.data.contentUsages);
        setTotalPages(response.data.totalPages);

        if (!contentTypeDisplayName)
          setContentTypeDisplayName(location.state?.contentType?.displayName);
      }
      setDataLoaded(true);
    }
  }, [response]);

  return (
    <Layout>
      <GridContainer
        ref={gridContainerRef}
        className="forte-optimizely-content-usage-grid"
      >
        <Grid>
          <GridCell large={12} medium={8} small={4}>
            <Header title={translations.title} />
          </GridCell>
          <GridCell large={12} medium={8} small={4}>
            {contentTypeDisplayName ? (
              <Breadcrumb items={breadcrumbItems} />
            ) : null}
          </GridCell>

          <GridCell large={12} medium={8} small={4}>
            <Filters
              searchValue={searchValue}
              onSearchChange={onSearchChange}
              onClearButtonClick={onClearButtonClick}
              columns={tableColumns}
              onTableColumnChange={onTableColumnChange}
            />
          </GridCell>

            <GridCell large={12}>
                {dataLoaded ? (
                    <div className="forte-optimizely-content-usage-table-container">
                        <DiscloseTable className="forte-optimizely-content-usage-table">
                            <Table.THead>
                                <Table.TR>
                                    {hasDiscloseTableRows && (
                                        <Table.TH
                                            isCollapsed={true}
                                            style={{paddingRight: "30px"}}
                                        />
                                    )}
                                    {tableColumns
                                        .filter((column) => column.visible)
                                        .map((column) => (
                                            <Table.TH
                                                sorting={{
                                                    canSort: column.sorting,
                                                    handleSort: () => {
                                                        setDataLoaded(false);
                                                        onSortChange(column);
                                                    },
                                                    order: sortDirection.toLowerCase(),
                                                }}
                                                key={column.id}
                                            >
                                                {column.name}
                                            </Table.TH>
                                        ))}
                                    <Table.TH width={100}/>
                                </Table.TR>
                            </Table.THead>

                            <Table.TBody>
                                {rows.length > 0 ? (
                                    rows.map((row) =>
                                        row.pageUrls.length > 1 ? (
                                            <ContentTypeUsageDiscloseTableRow
                                                key={`${row.id}-${row.languageBranch}`}
                                                {...row}
                                                tableColumns={tableColumns}
                                            />
                                        ) : (
                                            <ContentTypeUsageTableRow
                                                key={`${row.id}-${row.languageBranch}`}
                                                {...row}
                                                tableColumns={tableColumns}
                                                onRowClick={onTableRowClick(row.pageUrls[0])}
                                                onEditButtonClick={onTableRowClick(row.editUrl, true)}
                                                onViewWebsiteClick={onViewWebsiteClick(
                                                    row.pageUrls[0]
                                                )}
                                                hasDiscloseTableRows={hasDiscloseTableRows}
                                            />
                                        )
                                    )
                                ) : (
                                    <Table.TR noHover>
                                        <Table.TD colSpan={5}>{translations.noResults}</Table.TD>
                                    </Table.TR>
                                )}
                            </Table.TBody>
                        </DiscloseTable>
                    </div>
            ) : (
              <div className="forte-optimizely-content-usage-spinner__center">
                <Spinner />
              </div>
            )}
                    </GridCell>

          {totalPages > 1 && dataLoaded && (
                    <GridCell large={12} medium={8} small={4}>
                <PaginationControls
                    currentPage={currentPage}
                    goToPage={handlePageChange}
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

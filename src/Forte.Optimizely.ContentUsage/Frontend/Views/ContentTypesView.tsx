import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ButtonIcon,
  Dropdown,
  Grid,
  GridCell,
  GridContainer,
  PaginationControls,
  Table,
} from "optimizely-oui";
import { useLoaderData, useNavigate } from "react-router-dom";
import { CopyToClipboard } from "react-copy-to-clipboard";
import Layout from "../Components/Layout";
import { viewContentTypeUsages } from "../routes";
import {
  ContentTypeBaseDto,
  ContentTypeDto,
  ContentTypesResponse,
} from "../dtos";
import Header from "../Components/Header";
import Filters from "../Components/Filters/Filters";
import { APIResponse } from "../Lib/ContentUsageAPIClient";
import { useTranslations } from "../Contexts/TranslationsProvider";
import { useFilteredTableData } from "../Lib/hooks/useFilteredTableData";
import { TableColumn } from "../types";
import { useScroll } from "../Lib/hooks/useScroll";
import StatisticsCell from "../Components/Tables/StatisticsCell/StatisticsCell";
import PageLoader from "../Components/PageLoader/PageLoader";

enum ContentTypesTableColumn {
  GUID = "guid",
  DisplayName = "displayName",
  Name = "name",
  Type = "type",
  UsageCount = "usageCount",
  Statistics = "statistics",
  Actions = "actions",
}

const ContentTypesView = () => {
  const translations = useTranslations();
  const [initialContentTypeBases, setInitialContentTypeBases] = useState<
    ContentTypeBaseDto[]
  >([]);
  const [contentTypes, setContentTypes] = useState<ContentTypeDto[]>([]);
  const navigate = useNavigate();
  const gridContainerRef = useRef<HTMLElement>(null);
  const { scrollTo } = useScroll();

  const {
    views: {
      contentTypesView: {
        table: { columns, actions },
      },
    },
  } = translations;

  const initialTableColumns = [
    {
      id: ContentTypesTableColumn.GUID,
      name: columns.guid,
      visible: false,
      filter: true,
      sorting: false,
    },
    {
      id: ContentTypesTableColumn.Name,
      name: columns.name,
      visible: true,
      filter: true,
      sorting: true,
    },
    {
      id: ContentTypesTableColumn.DisplayName,
      name: columns.displayName,
      visible: true,
      filter: true,
      sorting: false,
    },
    {
      id: ContentTypesTableColumn.Type,
      name: columns.type,
      visible: true,
      filter: true,
      sorting: false,
    },
    {
      id: ContentTypesTableColumn.UsageCount,
      name: columns.usageCount,
      visible: true,
      filter: true,
      sorting: true,
    },
    {
      id: ContentTypesTableColumn.Statistics,
      name: columns.statistics,
      visible: true,
      filter: false,
      sorting: false,
    },
  ] as TableColumn<ContentTypeDto>[];

  const onTableRowClick = useCallback(
    (guid: string, displayName: string, alwaysTriggerClick = false) =>
      (event: React.PointerEvent) => {
        const target = event.target as HTMLTableCellElement | undefined;

        if ((target && target.tagName === "TD") || alwaysTriggerClick) {
          navigate(viewContentTypeUsages(guid), {
            state: { contentType: { displayName: displayName } },
          });
        }
      },
    [navigate]
  );

  const {
    dataLoaded,
    rows,
    searchValue,
    onSearchChange,
    onClearButtonClick,
    contentTypeBases,
    onContentTypeBaseChange,
    tableColumns,
    onTableColumnChange,
    sortDirection,
    onSortChange,
    currentPage,
    goToPage,
  } = useFilteredTableData({
    rows: contentTypes,
    initialTableColumns,
    initialContentTypeBases,
    disableFrontendFiltering: true,
    disableFrontendPagination: true,
    disableFrontendSorting: true,
    defaultVisiableColumn: "displayName",
  });

  const [totalPages, setTotalPages] = useState<number>();

  const handlePageChange = useCallback(
    (page: number) => {
      goToPage(page);

      if (gridContainerRef.current) {
        scrollTo(gridContainerRef.current);
      }
    },
    [goToPage]
  );

  const response = useLoaderData() as [
    APIResponse<ContentTypeBaseDto[]>,
    APIResponse<ContentTypesResponse>
  ];

  useEffect(() => {
    if (response) {
      const [contentTypeBasesResponse, contentTypesResponse] = response;

      if (
        !contentTypeBasesResponse.hasErrors &&
        contentTypeBasesResponse.data
      ) {
        setInitialContentTypeBases(
          contentTypeBasesResponse.data.map((contentTypeBase) => ({
            visible: true,
            ...contentTypeBase,
          }))
        );
      }

      if (!contentTypesResponse.hasErrors && contentTypesResponse.data) {
        setContentTypes(contentTypesResponse.data.contentTypes);
        setTotalPages(contentTypesResponse.data.totalPages);
      }
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
            <Filters
              searchValue={searchValue}
              onSearchChange={onSearchChange}
              onClearButtonClick={onClearButtonClick}
              contentTypeBases={contentTypeBases}
              onContentTypeBaseChange={onContentTypeBaseChange}
              columns={tableColumns}
              onTableColumnChange={onTableColumnChange}
            />
          </GridCell>

          <GridCell large={12} medium={8} small={4}>
            {dataLoaded ? (
              <div className="forte-optimizely-content-usage-table-container">
                <Table
                  className="forte-optimizely-content-usage-table"
                  shouldAddHover={rows.length > 0}
                >
                  <Table.THead>
                    <Table.TR>
                      {tableColumns
                        .filter((column) => column.visible)
                        .map((column) => (
                          <Table.TH
                            sorting={{
                              canSort: column.sorting,
                              handleSort: () => onSortChange(column),
                              order: sortDirection,
                            }}
                            key={column.id}
                          >
                            {column.name}
                          </Table.TH>
                        ))}
                      <Table.TH width={100} />
                    </Table.TR>
                  </Table.THead>

                  <Table.TBody>
                    {rows.length > 0 ? (
                      rows.map((row) => (
                        <Table.TR
                          key={row.guid}
                          onRowClick={onTableRowClick(
                            row.guid,
                            row.displayName || row.name
                          )}
                        >
                          {tableColumns
                            .filter((column) => column.visible)
                            .map((column) =>
                              column.id.toString() ===
                              ContentTypesTableColumn.Statistics ? (
                                <Table.TD
                                  className="vertical-align--middle"
                                  key={column.id}
                                >
                                  <StatisticsCell statistics={row.statistics} />
                                </Table.TD>
                              ) : (
                                <Table.TD key={column.id}>
                                  {row[column.id]}
                                </Table.TD>
                              )
                            )}
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
                                <Dropdown.ListItem
                                  onClick={onTableRowClick(
                                    row.guid,
                                    row.displayName || row.name,
                                    true
                                  )}
                                >
                                  <Dropdown.BlockLink>
                                    <Dropdown.BlockLinkText
                                      text={actions.viewUsages}
                                    />
                                  </Dropdown.BlockLink>
                                </Dropdown.ListItem>
                                <Dropdown.ListItem>
                                  <CopyToClipboard text={row.guid}>
                                    <Dropdown.BlockLink>
                                      <Dropdown.BlockLinkText
                                        text={actions.copyGuid}
                                      />
                                    </Dropdown.BlockLink>
                                  </CopyToClipboard>
                                </Dropdown.ListItem>
                              </Dropdown.Contents>
                            </Dropdown>
                          </Table.TD>
                        </Table.TR>
                      ))
                    ) : (
                      <Table.TR noHover>
                        <Table.TD colSpan={6}>
                          {translations.noResults}
                        </Table.TD>
                      </Table.TR>
                    )}
                  </Table.TBody>
                </Table>
              </div>
            ) : (
              <PageLoader />
            )}
          </GridCell>

          {totalPages && totalPages > 1 && dataLoaded && (
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

export default ContentTypesView;

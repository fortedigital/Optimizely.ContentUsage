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
  Grid,
  GridCell,
  GridContainer,
  PaginationControls,
  Spinner,
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
import ContentTypeUsagesTable, { ContentTypeUsageTableColumn } from "../Components/Tables/ContentTypeUsagesTable/ContentTypeUsageTable";

type ContentTypeUsageViewResponse =
  | APIResponse<GetContentUsagesResponse>
  | ContentTypeUsageViewInitialResponse;

type ContentTypeUsageViewInitialResponse = [
  APIResponse<ContentTypeDto>,
  APIResponse<GetContentUsagesResponse>
];


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
      columnSpanWidth: 1,
    },
    {
      id: ContentTypeUsageTableColumn.Name,
      name: columns.name,
      visible: true,
      filter: true,
      sorting: true,
      columnSpanWidth: 4,
    },
    {
      id: ContentTypeUsageTableColumn.LanguageBranch,
      name: columns.languageBranch,
      visible: true,
      filter: true,
      sorting: true,
      columnSpanWidth: 2,
    },
    {
      id: ContentTypeUsageTableColumn.PageUrls,
      name: columns.pageUrl,
      visible: true,
      sorting: false,
      columnSpanWidth: 5,
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

  const handleSortChange = useCallback((column: TableColumn<ContentUsageDto>) => {
    setDataLoaded(false);
    onSortChange(column);
  }, [setDataLoaded, onSortChange]);

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
                <ContentTypeUsagesTable rows={rows}
                                        tableColumns={tableColumns}
                                        sortDirection={sortDirection.toLowerCase()}
                                        onSortChange={handleSortChange}/>
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

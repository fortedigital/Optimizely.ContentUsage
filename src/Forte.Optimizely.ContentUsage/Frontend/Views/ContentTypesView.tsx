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
import { ContentTypeBaseDto, ContentTypeDto } from "../dtos";
import Header from "../Components/Header";
import Filters from "../Components/Filters/Filters";
import { APIResponse } from "../Lib/ContentUsageAPIClient";
import { useTranslations } from "../Contexts/TranslationsProvider";
import { useFilteredTableData } from "../Lib/hooks/useFilteredTableData";
import { TableColumn } from "../types";
import { useScroll } from "../Lib/hooks/useScroll";
import ForteTable from "../Components/Tables/ForteTable";
import ContentTypeTableRow from "../Components/Tables/ContentTypeTable/ContentTypeTableRow";

enum ContentTypesTableColumn {
  GUID = "guid",
  DisplayName = "displayName",
  Name = "name",
  Type = "type",
  UsageCount = "usageCount",
  Actions = "actions",
}

const ContentTypesView = () => {
  const [dataLoaded, setDataLoaded] = useState<boolean>(false);
  const translations = useTranslations();
  const [initialContentTypeBases, setInitialContentTypeBases] = useState<
    ContentTypeBaseDto[]
  >([]);
  const [contentTypes, setContentTypes] = useState<ContentTypeDto[]>([]);
  const navigate = useNavigate();
  const gridContainerRef = useRef<HTMLElement | null>();
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
    },
    {
      id: ContentTypesTableColumn.Name,
      name: columns.name,
      visible: true,
      filter: true,
    },
    {
      id: ContentTypesTableColumn.DisplayName,
      name: columns.displayName,
      visible: true,
      filter: true,
    },
    {
      id: ContentTypesTableColumn.Type,
      name: columns.type,
      visible: true,
      filter: true,
    },
    {
      id: ContentTypesTableColumn.UsageCount,
      name: columns.usageCount,
      visible: true,
      filter: true,
    },
  ] as TableColumn<ContentTypeDto>[];

  const {
    rows,
    searchValue,
    onSearchChange,
    onClearButtonClick,
    contentTypeBases,
    onContentTypeBaseChange,
    tableColumns,
    onTableColumnChange,
    selectedRowsPerPage,
    onRowsPerPageChange,
    sortDirection,
    onSortChange,
    totalPages,
    currentPage,
    goToPage,
  } = useFilteredTableData({
    rows: contentTypes,
    initialTableColumns,
    initialContentTypeBases,
    defaultVisiableColumn: "displayName",
  });

  const handlePageChange = useCallback(
    (page: number) => {
      goToPage(page);
      scrollTo(gridContainerRef.current);
    },
    [goToPage]
  );

  const response = useLoaderData() as [
    APIResponse<ContentTypeBaseDto[]>,
    APIResponse<ContentTypeDto[]>
  ];

  useEffect(() => {
    if (!dataLoaded && response && Array.isArray(response)) {
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
        setContentTypes(contentTypesResponse.data);
      }

      setDataLoaded(true);
    }
  }, [response, dataLoaded]);

  return (
    <Layout>
      <GridContainer ref={gridContainerRef} className="forte-optimizely-content-usage-grid">
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
              selectedRowsPerPage={selectedRowsPerPage}
              onRowsPerPageChange={onRowsPerPageChange}
            />
          </GridCell>

          <GridCell large={12} medium={8} small={4}>
            <div className="forte-optimizely-content-usage-table-container">
              <ForteTable
                tableColumns={tableColumns}
                rows={rows}
                rowTemplate={(row, columns) => (
                  <ContentTypeTableRow row={row} tableColumns={columns} />
                )}
                sortDirection={sortDirection}
                onSortChange={onSortChange}
              />
            </div>
          </GridCell>

          {totalPages > 1 && (
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

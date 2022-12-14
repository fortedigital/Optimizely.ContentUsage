import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Breadcrumb } from "@episerver/ui-framework";
import { TableColumn } from "../types";
import {
  Button,
  DiscloseTable,
  Grid,
  GridCell,
  GridContainer,
  Link,
  PaginationControls,
  Table,
} from "optimizely-oui";
import { useLoaderData, useLocation, useNavigate } from "react-router-dom";
import Layout from "../Components/Layout";
import { getRoutePath, viewContentTypes } from "../routes";
import { ContentTypeDto, ContentUsageDto } from "../dtos";
import { useFilteredTableData } from "../Lib/hooks/useFilteredTableData";
import { APIResponse } from "../Lib/EpiContentUsageAPIClient";
import Header from "../Components/Header";
import { useTranslations } from "../Contexts/TranslationsProvider";
import Filters from "../Components/Filters/Filters";

const ContentTypeUsageView = () => {
  const translations = useTranslations();
  const [contentTypeDisplayName, setContentTypeDisplayName] =
    useState<string>();
  const [contentTypeUsages, setContentTypeUsages] = useState<ContentUsageDto[]>(
    []
  );
  const location = useLocation();
  const navigate = useNavigate();

  const initialTableColumns = [
    { name: "id", value: "ID", visible: true, filter: true },
    { name: "guid", value: "GUID", visible: true, filter: true },
    { name: "name", value: "Name", visible: true, filter: true },
    { name: "languageBranch", value: "Language", visible: true, filter: true },
    { name: "pageUrl", value: "URL", visible: true, filter: true },
  ] as TableColumn<ContentUsageDto>[];

  const {
    rows,
    searchValue,
    onSearchChange,
    onClearButtonClick,
    tableColumns,
    useTableColumns,
    onTableColumnChange,
    selectedRowsPerPage,
    onRowsPerPageChange,
    sortDirection,
    onSortChange,
    totalPages,
    currentPage,
    goToPage,
  } = useFilteredTableData(contentTypeUsages, initialTableColumns);

  const tableColumnsWidthMap = useMemo(
    () =>
      new Map([
        [
          "id",
          useTableColumns((id, guid, name, languageBranch, pageUrl) => {
            if (!guid && !name && !languageBranch && !pageUrl) return "auto";
            return "60px";
          }),
        ],
        [
          "guid",
          useTableColumns((id, guid, name, languageBranch, pageUrl) => {
            if (!name && !pageUrl) return "auto";
            return "320px";
          }),
        ],
        ["name", "auto"],
        [
          "languageBranch",
          useTableColumns((id, guid, name, languageBranch, pageUrl) => {
            if (!guid && !pageUrl) return "auto";
            return "100px";
          }),
        ],
        [
          "pageUrl",
          useTableColumns((id, guid, name, languageBranch, pageUrl) => {
            if (!guid) return "auto";
            return "340px";
          }),
        ],
        [
          "actions",
          useTableColumns((id, guid, name, languageBranch, pageUrl) => {
            return "60px";
          }),
        ],
      ]),
    [useTableColumns]
  );

  const breadcrumbItems = [
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
  ];

  const onTableRowClick = useCallback(
    (editUrl: string) => navigate(editUrl),
    [navigate]
  );

  const response = useLoaderData() as
    | APIResponse<ContentUsageDto[]>
    | [APIResponse<ContentTypeDto>, APIResponse<ContentUsageDto[]>];

  useEffect(() => {
    if (response) {
      if (Array.isArray(response)) {
        const [contentTypeResponse, contentTypeUsagesResponse] = response;

        if (
          contentTypeUsagesResponse.data &&
          !contentTypeUsagesResponse.hasErrors
        )
          setContentTypeUsages(contentTypeUsagesResponse.data);

        if (contentTypeResponse.data && !contentTypeResponse.hasErrors)
          setContentTypeDisplayName(
            contentTypeResponse.data.displayName ||
              contentTypeResponse.data.name
          );
      } else if (response.data && !response.hasErrors) {
        setContentTypeDisplayName(location.state?.contentType?.displayName);
        setContentTypeUsages(response.data);
      }
    }
  }, [response]);

  return (
    <Layout>
      <GridContainer className="epi-content-usage-grid">
        <Grid>
          <GridCell large={12} medium={8} small={4}>
            <Header title={translations.title} />
          </GridCell>
          <GridCell large={12} medium={8} small={4}>
            {contentTypeDisplayName ? (
              <Breadcrumb items={breadcrumbItems} />
            ) : null}
          </GridCell>

          <GridCell large={8} medium={6} small={2}>
            <Filters
              searchValue={searchValue}
              onSearchChange={onSearchChange}
              onClearButtonClick={onClearButtonClick}
              columns={tableColumns}
              onTableColumnChange={onTableColumnChange}
              selectedRowsPerPage={selectedRowsPerPage}
              onRowsPerPageChange={onRowsPerPageChange}
            />
          </GridCell>

          <GridCell large={12}>
            <DiscloseTable className="epi-content-usage-table">
              <Table.THead>
                <Table.TR>
                  <Table.TH isCollapsed={true} />
                  {tableColumns
                    .filter((column) => column.visible)
                    .map((column) => (
                      <Table.TH
                        width={tableColumnsWidthMap.get(column.name)}
                        sorting={{
                          canSort: true,
                          handleSort: () => onSortChange(column),
                          order: sortDirection,
                        }}
                        key={column.name}
                      >
                        {column.value}
                      </Table.TH>
                    ))}
                  <Table.TH width={tableColumnsWidthMap.get(`actions`)} />
                </Table.TR>
              </Table.THead>

              <Table.TBody>
                {rows.length > 0 ? (
                  rows.map((row) => (
                    <DiscloseTable.Row
                      rowContents={[
                        ...tableColumns
                          .filter((column) => column.visible)
                          .map((column) => (
                            <Table.TD key={column.name}>
                              {column.name.toString() === "pageUrl" &&
                              row.pageUrls.length > 0 &&
                              row.pageUrls[0] ? (
                                <Link href={row.pageUrls[0]} newWindow>
                                  {row.pageUrls[0]}
                                </Link>
                              ) : (
                                row[column.name]
                              )}
                            </Table.TD>
                          )),
                        <Table.TD key="actions">
                          <Link href={row.editUrl}>
                            <Button size="small" width="default" isLink>
                              Edit
                            </Button>
                          </Link>
                        </Table.TD>,
                      ]}
                      isFullWidth
                      key={row.id}
                    >
                      <div className="flex soft-double--sides">
                        <div>
                          <Table>
                            <Table.THead>
                              <Table.TR>
                                <Table.TH>URL</Table.TH>
                              </Table.TR>
                            </Table.THead>
                            <Table.TBody>
                              {row.pageUrls.length > 0 &&
                                row.pageUrls.map((pageUrl, index) => (
                                  <Link key={index} href={pageUrl} newWindow>
                                    {pageUrl}
                                  </Link>
                                ))}
                            </Table.TBody>
                          </Table>
                        </div>
                      </div>
                    </DiscloseTable.Row>
                  ))
                ) : (
                  <Table.TR noHover>
                    <Table.TD colSpan={5}>No matching results</Table.TD>
                  </Table.TR>
                )}
              </Table.TBody>
            </DiscloseTable>
          </GridCell>

          {totalPages > 1 && (
            <GridCell large={12} medium={8} small={4}>
              <PaginationControls
                currentPage={currentPage}
                goToPage={goToPage}
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

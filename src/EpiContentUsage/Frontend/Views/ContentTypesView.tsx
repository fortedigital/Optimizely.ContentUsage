import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Button,
  Grid,
  GridCell,
  GridContainer,
  PaginationControls,
  Table,
} from "optimizely-oui";
import { Link, useLoaderData, useNavigate } from "react-router-dom";
import Layout from "../Components/Layout";
import { viewContentTypeUsages } from "../routes";
import { ContentTypeDto } from "../dtos";
import Header from "../Components/Header";
import Filters from "../Components/Filters/Filters";
import { APIResponse } from "../Lib/EpiContentUsageAPIClient";
import { useTranslations } from "../Contexts/TranslationsProvider";
import { useFilteredTableData } from "../Lib/hooks/useFilteredTableData";
import { TableColumn } from "../types";

const ContentTypesView = () => {
  const translations = useTranslations();
  const [contentTypes, setContentTypes] = useState<ContentTypeDto[]>([]);
  const navigate = useNavigate();

  const {
    views: {
      contentTypesView: {
        table: { columns, actions },
      },
    },
  } = translations;

  const initialTableColumns = [
    {
      name: "guid",
      value: columns.guid,
      visible: false,
      filter: true,
    },
    {
      name: "displayName",
      value: columns.displayName,
      visible: true,
      filter: true,
    },
    {
      name: "name",
      value: columns.name,
      visible: true,
      filter: true,
    },
    {
      name: "type",
      value: columns.type,
      visible: true,
      filter: true,
    },
    {
      name: "usageCount",
      value: columns.usageCount,
      visible: true,
      filter: true,
    },
  ] as TableColumn<ContentTypeDto>[];

  const onTableRowClick = useCallback(
    (guid: string, displayName: string) =>
      navigate(viewContentTypeUsages(guid), {
        state: { contentType: { displayName: displayName } },
      }),
    [navigate]
  );

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
  } = useFilteredTableData(contentTypes, initialTableColumns);

  const tableColumnsWidthMap = useMemo(
    () =>
      new Map([
        [
          "guid",
          useTableColumns((guid, displayName, name, type, usageCount) => {
            if (!displayName && !name) return "auto";
            return "320px";
          }),
        ],
        [
          "displayName",
          useTableColumns((guid, displayName, name, type, usageCount) => {
            if (!guid) return "auto";
            return "200px";
          }),
        ],
        ["name", "auto"],
        [
          "type",
          useTableColumns((guid, displayName, name, type, usageCount) => {
            if (!guid || !displayName) return "auto";
            return "150px";
          }),
        ],
        [
          "usageCount",
          useTableColumns((guid, displayName, name, type, usageCount) => {
            if (!guid || !displayName) return "auto";
            return "120px";
          }),
        ],
        [
          "actions",
          useTableColumns((guid, displayName, name, type, usageCount) => {
            return "100px";
          }),
        ],
      ]),
    [useTableColumns]
  );

  const response = useLoaderData() as APIResponse<ContentTypeDto[]>;

  useEffect(() => {
    if (response && !response.hasErrors && response.data)
      setContentTypes(response.data);
  }, [response]);

  return (
    <Layout>
      <GridContainer className="epi-content-usage-grid">
        <Grid>
          <GridCell large={12} medium={8} small={4}>
            <Header title={translations.title} />
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
            <Table
              className="epi-content-usage-table"
              shouldAddHover={rows.length > 0}
            >
              <Table.THead>
                <Table.TR>
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
                  <Table.TH width={tableColumnsWidthMap.get("actions")} />
                </Table.TR>
              </Table.THead>

              <Table.TBody>
                {rows.length > 0 ? (
                  rows.map((row) => (
                    <Table.TR
                      key={row.guid}
                      onRowClick={() =>
                        onTableRowClick(row.guid, row.displayName || row.name)
                      }
                    >
                      {tableColumns
                        .filter((column) => column.visible)
                        .map((column) => (
                          <Table.TD key={column.name}>
                            {row[column.name]}
                          </Table.TD>
                        ))}
                      <Table.TD verticalAlign="middle">
                        <Link to={viewContentTypeUsages(row.guid)}>
                          <Button size="small" width="default" isLink>
                            {actions.viewUsages}
                          </Button>
                        </Link>
                      </Table.TD>
                    </Table.TR>
                  ))
                ) : (
                  <Table.TR noHover>
                    <Table.TD colSpan={6}>{translations.noResults}</Table.TD>
                  </Table.TR>
                )}
              </Table.TBody>
            </Table>
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

export default ContentTypesView;

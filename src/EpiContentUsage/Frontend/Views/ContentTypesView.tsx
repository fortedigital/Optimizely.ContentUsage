import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
import { ContentTypeDto } from "../dtos";
import Header from "../Components/Header";
import Filters from "../Components/Filters/Filters";
import { APIResponse } from "../Lib/EpiContentUsageAPIClient";
import { useTranslations } from "../Contexts/TranslationsProvider";
import { useFilteredTableData } from "../Lib/hooks/useFilteredTableData";
import { TableColumn } from "../types";

const ContentTypesView = () => {
  const [dataLoaded, setDataLoaded] = useState<boolean>(false);
  const translations = useTranslations();
  const [contentTypes, setContentTypes] = useState<ContentTypeDto[]>([]);
  const navigate = useNavigate();
  const gridContainerRef = useRef<HTMLElement | null>();

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
  } = useFilteredTableData({
    rows: contentTypes,
    initialTableColumns,
  });

  const scrollToTop = useCallback(
    () => gridContainerRef.current?.scrollIntoView({ behavior: "smooth" }),
    []
  );

  const handlePageChange = useCallback(
    (page: number) => {
      goToPage(page);
      scrollToTop();
    },
    [goToPage]
  );

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
    if (!dataLoaded && response && !response.hasErrors && response.data) {
      setDataLoaded(true);
      setContentTypes(response.data);
    }
  }, [response, dataLoaded]);

  return (
    <Layout>
      <GridContainer ref={gridContainerRef} className="epi-content-usage-grid">
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
                      onRowClick={onTableRowClick(
                        row.guid,
                        row.displayName || row.name
                      )}
                    >
                      {tableColumns
                        .filter((column) => column.visible)
                        .map((column) => (
                          <Table.TD key={column.name}>
                            {row[column.name]}
                          </Table.TD>
                        ))}
                      <Table.TD verticalAlign="middle">
                        <Dropdown
                          activator={
                            <ButtonIcon
                              iconName="ellipsis"
                              size="small"
                              style="plain"
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
                            <Dropdown.ListItem onClick={null}>
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

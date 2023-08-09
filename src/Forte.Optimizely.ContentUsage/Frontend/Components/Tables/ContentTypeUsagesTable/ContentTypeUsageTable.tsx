import { Table } from "optimizely-oui";
import React, { useCallback } from "react";
import { translations } from "../../../translations";
import { ContentUsageDto } from "../../../dtos";
import { TableColumn } from "../../../types";
import ContentTypeUsageTableRow from "./ContentTypeUsageTableRow/ContentTypeUsageTableRow";
import { navigateTo } from "../../../routes";

enum ContentTypeUsageTableColumn {
  ID = "id",
  Name = "name",
  LanguageBranch = "languageBranch",
  PageUrl = "pageUrl",
  Actions = "actions",
}

interface ContentTypeUsagesTableProps {
  tableColumns: TableColumn<ContentUsageDto>[];
  rows: ContentUsageDto[];
  onSortChange: (column: TableColumn<ContentUsageDto>) => void;
  sortDirection: string;
}

const ContentTypeUsagesTable = ({
  tableColumns,
  rows,
  onSortChange,
  sortDirection,
}: ContentTypeUsagesTableProps) => {
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

  return (
    <Table
      tableLayoutAlgorithm="fixed"
      className="forte-optimizely-content-usage-table"
    >
      <Table.THead>
        <Table.TR>
          {tableColumns
            .filter((column) => column.visible)
            .map((column) => (
              <>
                <Table.TH
                  colSpan={column.columnSpanWidth}
                  sorting={{
                    canSort: column.sorting,
                    handleSort: () => onSortChange(column),
                    order: sortDirection,
                  }}
                  key={column.id}
                >
                  {column.name}
                </Table.TH>
              </>
            ))}
        </Table.TR>
      </Table.THead>

      <Table.TBody>
        {rows.length > 0 ? (
          rows.map(
            (row) => (
              <ContentTypeUsageTableRow
                key={`${row.id}-${row.languageBranch}`}
                {...row}
                tableColumns={tableColumns}
                onRowClick={onTableRowClick(row.editUrl)}
              />
            )
          )
        ) : (
          <Table.TR noHover>
            <Table.TD colSpan={5}>{translations.noResults}</Table.TD>
          </Table.TR>
        )}
      </Table.TBody>
    </Table>
  );
};

export default ContentTypeUsagesTable;
export { ContentTypeUsageTableColumn };

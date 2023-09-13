import { Table } from "optimizely-oui";
import { useTranslations } from "../../../../Contexts/TranslationsProvider";
import { ContentUsageDto } from "../../../../dtos";
import { TableColumn } from "../../../../types";
import PageUrlCell from "../../PageUrlCell/PageUrlCell";
import React, { useCallback } from "react";
import { useHoverTrackingHandlers } from "../../../../Lib/hooks/useHoverTrackingHandlers";
import { navigateTo } from "../../../../routes";
import TableRow from "../../TableRow";

interface ContentTypeUsageTableRowProps<TableDataType> extends ContentUsageDto {
  tableColumns: TableColumn<TableDataType>[];
  onRowClick?: (event: React.PointerEvent) => void;
}

const ContentTypeUsageTableRow = ({
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

  const [isUrlHovered, urlHoveredHandlers] = useHoverTrackingHandlers();
  const actionLabel = isUrlHovered ? actions.view : actions.edit;

  const onTableRowClick = useCallback(
    (url?: string | null) => (event: React.PointerEvent) => {
      if (!url) return;

      const target = event.target as HTMLTableCellElement | undefined;

      if (target && target.tagName === "TD") {
        navigateTo(url, true);
      }
    },
    [navigateTo]
  );

  return (
    <TableRow
      key={`${row.id}-${row.languageBranch}`}
      className="forte-optimizely-content-usage-table-row"
      row={row}
      tableColumns={tableColumns}
      onTableRowClick={onTableRowClick(row.editUrl)}
      specificCells={{
        pageUrls: (_, pageUrls) => <PageUrlCell pageUrls={pageUrls} urlHoveredHandlers={urlHoveredHandlers}/>
      }}
      additionalCellAtTheRowEnd={
        <Table.TD colSpan={1}>
          <span className="forte-optimizely-content-usage-action-label">
            {actionLabel + " >"}
          </span>
        </Table.TD>
      }
    />
  );
};

export default ContentTypeUsageTableRow;
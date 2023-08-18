import { Table } from "optimizely-oui";
import { useTranslations } from "../../../../Contexts/TranslationsProvider";
import { ContentUsageDto } from "../../../../dtos";
import { TableColumn } from "../../../../types";
import PageUrlCell from "../../PageUrlCell/PageUrlCell";
import React from "react";
import { ContentTypeUsageTableColumn } from "../ContentTypeUsageTable";
import { useHoverTrackingHandlers } from "../../../../Lib/hooks/useHoverTrackingHandlers";

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
    const actionLabel = isUrlHovered ? "View" : "Edit";

    return (
      <Table.TR class="forte-optimizely-content-usage-table-row" onRowClick={onRowClick}>
        { tableColumns
          .filter((column) => column.visible)
          .map((column) =>
          <Table.TD colSpan={column.columnSpanWidth}>
            { column.id.toString() === ContentTypeUsageTableColumn.PageUrl &&
            row.pageUrls.length > 0 ? (
                <PageUrlCell pageUrls={row.pageUrls} urlHoveredHandlers={urlHoveredHandlers}/>
            ) : (
                row[column.id]
            )}
          </Table.TD>
        )}
        <Table.TD colSpan={1}><span className="forte-optimizely-content-usage-action-label">{actionLabel + " >"}</span></Table.TD>
      </Table.TR>
    );
  };

export default ContentTypeUsageTableRow;
  
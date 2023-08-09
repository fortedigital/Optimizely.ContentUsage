import { Table } from "optimizely-oui";
import { useTranslations } from "../../../../Contexts/TranslationsProvider";
import { ContentUsageDto } from "../../../../dtos";
import { TableColumn } from "../../../../types";
import PageUrlCell from "../../PageUrlCell/PageUrlCell";
import React from "react";
import { ContentTypeUsageTableColumn } from "../ContentTypeUsageTable";

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
  
    return (
      <Table.TR onRowClick={onRowClick}>
        { tableColumns
          .filter((column) => column.visible)
          .map((column) =>
          <Table.TD colSpan={column.columnSpanWidth}>
            { column.id.toString() === ContentTypeUsageTableColumn.PageUrl &&
            row.pageUrls.length > 0 ? (
                <PageUrlCell pageUrls={row.pageUrls} />
            ) : (
                row[column.id]
            )}
          </Table.TD>
        )}
      </Table.TR>
    );
  };

export default ContentTypeUsageTableRow;
  
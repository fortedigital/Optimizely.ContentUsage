import { Table } from "optimizely-oui";
import React, { ReactNode, useCallback } from "react";
import { TableColumn } from "../../types";


interface TableRowProps<TItem> {
    key: unknown;
    className?: string;
    row: TItem;
    tableColumns: TableColumn<TItem>[];
    onTableRowClick: (event: React.PointerEvent) => void;
    additionalCellAtTheRowEnd?: ReactNode;
    specificCells?: {[c in keyof TItem]?: (column: TableColumn<TItem>, row: TItem[c]) => ReactNode};
}
 
function TableRow<TItem>({
  key,
  className,
  row,
  tableColumns,
  onTableRowClick,
  additionalCellAtTheRowEnd,
  specificCells,
}: TableRowProps<TItem>) {
  const renderCell = useCallback(
    (column: TableColumn<TItem>, row: TItem) => {
      const specificCell = specificCells[column.id];

      if (specificCell !== undefined) {
        return specificCell(column, row[column.id]);
      }

      return row[column.id];
    },
    [specificCells]
  );

  return (
    <Table.TR key={key} className={className} onRowClick={onTableRowClick}>
      {tableColumns
        .filter((column) => column.visible)
        .map((column) => (
          <Table.TD key={column.id} colSpan={column.columnSpanWidth}>
            {renderCell(column, row)}
          </Table.TD>
        ))}
      {additionalCellAtTheRowEnd}
    </Table.TR>
  );
}
 
export default TableRow;
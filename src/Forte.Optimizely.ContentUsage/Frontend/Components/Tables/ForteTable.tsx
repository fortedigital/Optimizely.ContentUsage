import { Table, Dropdown, ButtonIcon } from "optimizely-oui";
import React, { FC, ReactNode, useCallback } from "react";
import { translations } from "../../translations";
import { SortDirection, TableColumn } from "../../types";
import { SortChangeHandler } from "../../Lib/hooks/useFilteredTableData";
import TableHeader from "./TableHeader";

interface ForteTableProps<TItem> {
    tableColumns: TableColumn<TItem>[];
    rows: TItem[];
    rowTemplate: (row: TItem, columns: TableColumn<TItem>[]) => ReactNode;
    sortDirection: SortDirection;
    onSortChange: SortChangeHandler<TItem>
}
 
function ForteTable<TItem>({
  rows,
  rowTemplate,
  tableColumns,
  sortDirection,
  onSortChange,
}: ForteTableProps<TItem>) {
  return (
    <Table
      className="forte-optimizely-content-usage-table"
      shouldAddHover={rows.length > 0}
    >
      <TableHeader tableColumns={tableColumns} sortDirection={sortDirection} onSortChange={onSortChange} />

      <Table.TBody>
        {rows.length > 0 ? (
          rows.map((row) => (
            rowTemplate(row, tableColumns)
          ))
        ) : (
          <Table.TR noHover>
            <Table.TD colSpan={6}>{translations.noResults}</Table.TD>
          </Table.TR>
        )}
      </Table.TBody>
    </Table>
  );
};
 
export default ForteTable;
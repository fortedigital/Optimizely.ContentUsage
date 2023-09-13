import { Table } from "optimizely-oui";
import React, { FC } from "react";
import { SortDirection, TableColumn } from "../../types";

interface TableHeaderProps<TItem> {
  tableColumns: TableColumn<TItem>[];
  sortDirection: SortDirection;
  onSortChange: (column: TableColumn<TItem>) => void;
}

function TableHeader<TItem>({
  tableColumns,
  sortDirection,
  onSortChange,
}: TableHeaderProps<TItem>) {
  return (
    <Table.THead>
      <Table.TR>
        {tableColumns
          .filter((column) => column.visible)
          .map((column) => (
            <Table.TH
              sorting={{
                canSort: true,
                handleSort: () => onSortChange(column),
                order: sortDirection,
              }}
              key={column.id}
            >
              {column.name}
            </Table.TH>
          ))}
        <Table.TH width={100} />
      </Table.TR>
    </Table.THead>
  );
};

export default TableHeader;

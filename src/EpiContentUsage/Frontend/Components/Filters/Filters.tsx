import React from "react";
import { TableColumn } from "../../types";
import ColumnsFilter from "./ColumnsFilter";
import "./Filters.scss";
import NumberOfRowsFilter from "./NumberOfRowsFilter";
import SearchInput from "./SearchInput";

interface FiltersProps<TableDataType> {
  searchValue?: string;
  onSearchChange?: (...args: any[]) => any;
  onClearButtonClick?: (...args: any[]) => any;
  columns?: TableColumn<TableDataType>[];
  onTableColumnChange?: (column: keyof TableDataType, visible: boolean) => void;
  rowsPerPageOptions?: number[];
  selectedRowsPerPage?: number;
  onRowsPerPageChange?: (option: number) => void;
}

function Filters<TableDataType>({
  searchValue,
  onSearchChange,
  onClearButtonClick,
  columns,
  onTableColumnChange,
  rowsPerPageOptions,
  selectedRowsPerPage,
  onRowsPerPageChange,
}: FiltersProps<TableDataType>) {
  return (
    <div className="epi-content-usage-filters">
      <SearchInput
        value={searchValue}
        onChange={onSearchChange}
        onClearButtonClick={onClearButtonClick}
      />

      {columns?.length > 0 && (
        <ColumnsFilter columns={columns} onChange={onTableColumnChange} />
      )}

      {typeof selectedRowsPerPage !== "undefined" && (
        <NumberOfRowsFilter
          rowsPerPageOptions={rowsPerPageOptions}
          selected={selectedRowsPerPage}
          onChange={onRowsPerPageChange}
        />
      )}
    </div>
  );
}

export default Filters;

import React from "react";
import { ContentTypeBase, TableColumn } from "../../types";
import ColumnsFilter from "./ColumnsFilter";
import ContentTypeBasesFilter from "./ContentTypeBasesFilter";
import "./Filters.scss";
import NumberOfRowsFilter from "./NumberOfRowsFilter";
import SearchInput from "./SearchInput";

interface FiltersProps<TableDataType> {
  searchValue?: string;
  onSearchChange?: (...args: any[]) => any;
  onClearButtonClick?: (...args: any[]) => any;
  contentTypeBases?: ContentTypeBase[];
  onContentTypeBaseChange?: (contentTypeBase: ContentTypeBase) => void;
  columns?: TableColumn<TableDataType>[];
  onTableColumnChange?: (column: keyof TableDataType, visible: boolean) => void;
  rowsPerPageOptions?: number[];
  selectedRowsPerPage?: number;
  onRowsPerPageChange?: (option: number) => void;
  isLoading?: boolean;
}

function Filters<TableDataType>({
  searchValue,
  onSearchChange,
  onClearButtonClick,
  contentTypeBases,
  onContentTypeBaseChange,
  columns,
  onTableColumnChange,
  rowsPerPageOptions,
  selectedRowsPerPage,
  onRowsPerPageChange,
  isLoading,
}: FiltersProps<TableDataType>) {
  return (
    <div className="forte-optimizely-content-usage-filters">
      <SearchInput
        value={searchValue}
        onChange={onSearchChange}
        onClearButtonClick={onClearButtonClick}
        disabled={isLoading}
      />

      {contentTypeBases?.length > 0 && (
        <ContentTypeBasesFilter
          contentTypeBases={contentTypeBases}
          onChange={onContentTypeBaseChange}
          disabled={isLoading}
        />
      )}

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

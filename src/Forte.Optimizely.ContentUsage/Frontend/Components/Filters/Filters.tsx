import React from "react";
import { ContentTypeBase, TableColumn } from "../../types";
import ColumnsFilter from "./ColumnsFilter";
import ContentTypeBasesFilter from "./ContentTypeBasesFilter";
import "./Filters.scss";
import NumberOfRowsFilter from "./NumberOfRowsFilter";
import SearchInput from "./SearchInput";
import IncludeDeletedFilter from "./IncludeDeletedFilter";

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
  includeDeleted?: boolean;
  onIncludeDeletedChange?: React.ChangeEventHandler<HTMLInputElement>;
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
  includeDeleted,
  onIncludeDeletedChange,
}: FiltersProps<TableDataType>) {
  return (
    <div className="forte-optimizely-content-usage-filters">
      <SearchInput
        value={searchValue}
        onChange={onSearchChange}
        onClearButtonClick={onClearButtonClick}
      />

      {contentTypeBases?.length > 0 && (
        <ContentTypeBasesFilter
          contentTypeBases={contentTypeBases}
          onChange={onContentTypeBaseChange}
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

      {typeof includeDeleted !== "undefined" && !!onIncludeDeletedChange && (
        <IncludeDeletedFilter
          includeDeleted={includeDeleted}
          onIncludeDeletedChange={onIncludeDeletedChange}
        />
      )}

    </div>
  );
}

export default Filters;

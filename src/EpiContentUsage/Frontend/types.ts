export enum SortDirection {
  Ascending = "asc",
  Descending = "desc",
}

export interface TableColumn<TableDataType> {
  name: keyof TableDataType;
  value: string;
  visible?: boolean;
  filter?: boolean;
}

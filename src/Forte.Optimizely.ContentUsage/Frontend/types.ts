export interface TableColumn<TableDataType> {
  id: keyof TableDataType;
  name: string;
  visible?: boolean;
  filter?: boolean;
}

export interface ContentTypeBase {
  name: string;
  visible?: boolean;
}
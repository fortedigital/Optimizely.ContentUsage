export interface ContentType {
  guid: string;
  displayName?: string;
  name?: string;
  type?: string;
  usageCount: number;
}

export interface ContentTypeUsage {
  id: number;
  contentTypeGuid: string;
  name?: string;
  languageBrach?: string;
  pageUrls?: string[];
  editUrl: string;
}

export enum SortDirection {
  Ascending = "asc",
  Descending = "desc",
}

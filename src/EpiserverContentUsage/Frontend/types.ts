export interface ContentType {
    guid: string;
    displayName?: string;
    name?: string;
    type?: string;
    usageCount: number;
}

export type TableColumn = "guid" | "name" | "displayName" | "type" | "usageCount";

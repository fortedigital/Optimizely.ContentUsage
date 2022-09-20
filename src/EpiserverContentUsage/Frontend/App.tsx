import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Card, ContentArea, DataTable, DataTableBody, DataTableCell, DataTableColumnHeaderCell, DataTableContent, DataTableHeaderRow, DataTableRow, DataTableToolbar, Grid, TextButton, TextField, Typography, Workspace, ClearIcon, Search, Breadcrumb, SortDirection, DataTablePagination } from "@episerver/ui-framework";
import "@episerver/ui-framework/dist/main.css";
import { AppModel } from "./dtos";

import "./Styles/Table.scss";

interface AppProps {
    model: AppModel;
}

interface ContentType {
    guid: string;
    displayName?: string;
    name?: string;
    type?: string;
    usageCount: number;
}

type SortColumn = "displayName" | "type" | "usageCount";

export const App = ({ model: { getContentTypesEndpointUrl, getContentUsagesEndpointUrl} }: AppProps) => {
    const [contentTypes, setContentTypes] = useState<ContentType[]>([]);
    const [searchValue, setSearchValue] = useState<string>("");
    const [sortBy, setSortBy] = useState<SortColumn | null>(null);
    const [sortDirection, setSortDirection] = useState<SortDirection>(0);
    const [startRow, setStartRow] = useState<number>(0);
    const [rowsPerPage, setRowsPerPage] = useState<number>(10);

    useEffect(() => {
        axios.get<ContentType[]>(getContentTypesEndpointUrl)
            .then(response => {
                setContentTypes(response.data);
            });
    }, []);

    const tableColumns = [
        { name: 'displayName', value: 'Display name', width: '55%' },
        { name: 'type', value: 'Type', width: '30%' },
        { name: 'usageCount', value: 'Usage count', width: '15%' }
    ];

    const rowsPerPageOptions = [10, 20, 30];

    const onTableSort = useCallback(
        (column: SortColumn, direction: SortDirection) => {
            setSortBy(column);
            setSortDirection(direction);
        },
        [setSortBy, setSortDirection],
    );

    const filteredItems = useMemo(() => {
        return contentTypes
            .filter((value) => {
                if (!searchValue) return true;

                if (value.displayName?.toLocaleLowerCase().includes(searchValue.toLocaleLowerCase())) return true;
                if (value.name?.toLocaleLowerCase().includes(searchValue.toLocaleLowerCase())) return true;
                if (value.type?.toLocaleLowerCase().includes(searchValue.toLocaleLowerCase())) return true;
                if (parseInt(searchValue) && value.usageCount === parseInt(searchValue)) return true;
                if (value.guid.includes(searchValue)) return true;

                return false;
            })
            .sort((prevValue, nextValue) => {
                if (sortDirection === 1) return prevValue[sortBy] > nextValue[sortBy] ? -1 : 1;
                else if (sortDirection === 2) return prevValue[sortBy] > nextValue[sortBy] ? 1 : -1;
                else return 0;
            });
    }, [contentTypes, sortDirection, sortBy, searchValue]);

    const tableItems = useMemo(() => 
        filteredItems.slice(startRow, startRow + rowsPerPage), 
    [filteredItems, startRow, rowsPerPage]);

    return (
        <div className="content-area-container">
            <ContentArea>
                <Workspace>
                    <div className="epi-main-header">
                        <Typography tag="h2" use="headline4">Content Usage</Typography>
                    </div>

                    {/* <Breadcrumb 
                        items={[
                            { title: "Content types", level: 1, link: "" },
                            { title: "Article", level: 2, link: "", active: true }
                        ]}
                    /> */}

                    <DataTable>
                        <DataTableToolbar>
                            <Search 
                                value={searchValue} 
                                onValueChange={(value) => setSearchValue(value)} 
                                onSearch={(value) => setSearchValue(value)}
                            />
                        </DataTableToolbar>
                        <DataTableContent>
                            <DataTableHeaderRow>
                                {tableColumns.map(({ name, value, width }) => (
                                    <DataTableColumnHeaderCell 
                                        key={name} 
                                        sortDirection={sortBy === name && sortDirection}
                                        onSort={(_, sortDirection) => onTableSort(name as SortColumn, sortDirection)}
                                        style={{ width: width }}
                                    >
                                        {value}
                                    </DataTableColumnHeaderCell>
                                ))}
                            </DataTableHeaderRow>
                            <DataTableBody>
                                {tableItems.length > 0 ? 
                                    tableItems.map(({ guid, name, displayName, type, usageCount }) => (
                                        <DataTableRow key={guid} rowId={guid} onClick={() => {}}>
                                            <DataTableCell>
                                                {displayName || name}
                                            </DataTableCell>
                                            <DataTableCell>
                                                {type}
                                            </DataTableCell>
                                            <DataTableCell>
                                                {usageCount}
                                            </DataTableCell>
                                        </DataTableRow>
                                    )) : (
                                        <DataTableRow rowId="noResults">
                                            <DataTableCell>
                                                No matching results
                                            </DataTableCell>
                                        </DataTableRow>
                                    )}
                            </DataTableBody>
                        </DataTableContent>
                        <DataTablePagination 
                            startRow={startRow}
                            totalRowCount={filteredItems.length}
                            rowsPerPage={rowsPerPage}
                            rowsPerPageOptions={rowsPerPageOptions}
                            onChangePage={(startRow) => setStartRow(startRow)}
                            onChangeRowsPerPage={(rowsPerPage) => setRowsPerPage(rowsPerPage)}
                        />
                    </DataTable>
                </Workspace>
            </ContentArea>
        </div>
    );
}

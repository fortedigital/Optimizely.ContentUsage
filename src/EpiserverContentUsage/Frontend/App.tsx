import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Card, ContentArea, DataTable, DataTableBody, DataTableCell, DataTableColumnHeaderCell, DataTableContent, DataTableHeaderRow, DataTableRow, DataTableToolbar, Grid, TextButton, TextField, Typography, Workspace, ClearIcon, Search, Breadcrumb, SortDirection, DataTablePagination, DataTableColumnManageButton } from "@episerver/ui-framework";
import "@episerver/ui-framework/dist/main.css";
import { AppModel } from "./dtos";

import "./Styles/Table.scss";
import Router from "./Components/Router";
import ContentTypeUsageView from "./Views/ContentTypeUsageView";
import ContentTypesView from "./Views/ContentTypesView";

interface AppProps {
    model: AppModel;
}

export const App = ({ model: { getContentTypesEndpointUrl, getContentUsagesEndpointUrl} }: AppProps) => {
    return (
        <Router>
            {(guid) => guid ? 
                (
                    <ContentTypeUsageView endpointUrl={getContentUsagesEndpointUrl} />
                ) : (
                    <ContentTypesView endpointUrl={getContentTypesEndpointUrl} />
                )
            }
        </Router>
    );
}

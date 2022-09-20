import React from "react";
import {Card, TextButton, Workspace} from "@episerver/ui-framework";
import "@episerver/ui-framework/dist/main.css";
import {AppModel} from "./dtos";

interface AppProps {
    model: AppModel;
}

export const App = ({model}: AppProps) => (
    <Workspace>
        <Card>
            <TextButton href={model.getContentTypesEndpointUrl}>Content Types Endpoint</TextButton>
            <TextButton href={model.getContentUsagesEndpointUrl}>Content Usages Endpoint</TextButton>
        </Card>
    </Workspace>
);
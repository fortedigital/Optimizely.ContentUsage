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
            <h1>{model.moduleBaseUrl}</h1>
            <TextButton href={model.contentTypeBasesEndpointUrl}>Content Type Bases Endpoint</TextButton>
            <TextButton href={model.contentTypesEndpointUrl}>Content Types Endpoint</TextButton>
            <TextButton href={model.contentUsagesEndpointUrl}>Content Usages Endpoint</TextButton>
        </Card>
    </Workspace>
);
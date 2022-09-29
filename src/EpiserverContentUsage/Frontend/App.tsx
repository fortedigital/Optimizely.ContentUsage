import React from "react";
import "@episerver/ui-framework/dist/main.css";
import "optimizely-oui/dist/styles.css";
import { AppModel } from "./dtos";

import "./Styles/content-usage.scss";
import { Api } from "./Lib/Api";
import Router from "./Components/Router";

interface AppProps {
  baseUrl?: string;
  model: AppModel;
}

export const App = ({
  baseUrl,
  model: { getContentTypesEndpointUrl, getContentUsagesEndpointUrl },
}: AppProps) => {
  Api.setEndpoints({
    getContentTypes: getContentTypesEndpointUrl,
    getContentTypeUsages: getContentUsagesEndpointUrl,
  });

  return (
    <div className="epi-content-usage">
      <Router baseUrl={baseUrl} />
    </div>
  );
};

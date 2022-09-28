import React from "react";
import "@episerver/ui-framework/dist/main.css";
import "optimizely-oui/dist/styles.css";
import { AppModel } from "./dtos";

import "./Styles/content-usage.scss";
import Router from "./Components/Router";
import ContentTypeUsageView from "./Views/ContentTypeUsageView";
import ContentTypesView from "./Views/ContentTypesView";

interface AppProps {
  model: AppModel;
}

export const App = ({
  model: { getContentTypesEndpointUrl, getContentUsagesEndpointUrl },
}: AppProps) => {
  return (
    <Router>
      {(guid, contentTypeName) =>
        guid ? (
          <ContentTypeUsageView
            endpointUrl={getContentUsagesEndpointUrl}
            guid={guid}
            contentTypeName={contentTypeName}
          />
        ) : (
          <ContentTypesView endpointUrl={getContentTypesEndpointUrl} />
        )
      }
    </Router>
  );
};

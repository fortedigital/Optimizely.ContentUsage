import React from "react";

import "./Styles/optimizely-oui.scss";
import "./Styles/forte-optimizely-content-usage.scss";
import Router from "./Components/Router";
import APIProvider from "./Contexts/ApiProvider";
import { AppModel } from "./dtos";
import TranslationsProvider from "./Contexts/TranslationsProvider";

interface AppProps {
  model: AppModel;
}

export const App = ({ model: { moduleBaseUrl, ...endpoints } }: AppProps) => {
  return (
    <div className="forte-optimizely-content-usage">
      <TranslationsProvider>
        <APIProvider {...endpoints}>
          <Router baseUrl={moduleBaseUrl} />
        </APIProvider>
      </TranslationsProvider>
    </div>
  );
};

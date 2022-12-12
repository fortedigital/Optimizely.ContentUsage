import React from "react";

import "./Styles/content-usage.scss";
import "./App.scss";
import Router from "./Components/Router";
import APIProvider from "./Contexts/ApiProvider";
import { AppModel } from "./dtos";

interface AppProps {
  model: AppModel;
}

export const App = ({ model: { moduleBaseUrl, ...endpoints } }: AppProps) => {
  return (
    <div className="epi-content-usage">
      <APIProvider {...endpoints}>
        <Router baseUrl={moduleBaseUrl} />
      </APIProvider>
    </div>
  );
};

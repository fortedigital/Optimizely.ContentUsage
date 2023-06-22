import React from "react";
import ReactDOM from "react-dom";
import { App } from "./App";
import { AppModel } from "./dtos";

declare const appModel: AppModel;

const rootNode = document.getElementById("epi-content-usage-root");

ReactDOM.render(<App model={appModel} />, rootNode);

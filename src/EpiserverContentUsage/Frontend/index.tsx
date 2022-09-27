import React from "react";
import ReactDOM from "react-dom";
import { App } from "./App";

const rootNode = document.getElementById("react-app");

// @ts-ignore
ReactDOM.render(<App model={appModel} />, rootNode);

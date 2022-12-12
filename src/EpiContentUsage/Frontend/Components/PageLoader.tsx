import React from "react";
import { Spinner } from "optimizely-oui";

import "./PageLoader.scss";

const PageLoader = () => (
  <div className="page-loader">
    <Spinner />
  </div>
);

export default PageLoader;

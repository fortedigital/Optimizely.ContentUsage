import React from "react";
import { Spinner } from "optimizely-oui";

import "./PageLoader.scss";

const PageLoader = () => (
  <div className="epi-content-usage-page-loader">
    <Spinner />
  </div>
);

export default PageLoader;

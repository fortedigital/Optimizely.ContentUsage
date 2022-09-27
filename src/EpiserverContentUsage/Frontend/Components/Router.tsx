import React, { useState } from "react";
import { RouterContext } from "../router-context";

type RouterContextFunction = (
  guid?: string | null,
  setGuid?: (guid: string | null) => void,
  goBack?: () => void,
  viewContentTypeUsage?: (guid: string) => void
) => React.ReactNode;

const Router = ({ children }: { children: RouterContextFunction }) => {
  const [guid, setGuid] = useState<string | null>(null);
  const goBack = () => setGuid(null);
  const viewContentTypeUsage = (guid: string) => setGuid(guid);

  return (
    <RouterContext.Provider
      value={{ guid, setGuid, goBack, viewContentTypeUsage }}
    >
      {children(guid, setGuid, goBack, viewContentTypeUsage)}
    </RouterContext.Provider>
  );
};

export default Router;

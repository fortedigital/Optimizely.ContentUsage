import React, { useState } from "react";
import { RouterContext } from "../router-context";

type RouterContextFunction = (
  guid?: string | null,
  contentTypeName?: string | null,
  setGuid?: (guid: string | null) => void,
  setContentTypeName?: (name: string | null) => void,
  goBack?: () => void,
  viewContentTypeUsage?: (guid: string, name: string) => void
) => React.ReactNode;

const Router = ({ children }: { children: RouterContextFunction }) => {
  const [guid, setGuid] = useState<string | null>(null);
  const [contentTypeName, setContentTypeName] = useState<string>("");
  const goBack = () => setGuid(null);
  const viewContentTypeUsage = (guid: string, name: string) => {
    setGuid(guid);
    setContentTypeName(name);
  };

  return (
    <RouterContext.Provider
      value={{
        guid,
        setGuid,
        contentTypeName,
        setContentTypeName,
        goBack,
        viewContentTypeUsage,
      }}
    >
      {children(
        guid,
        contentTypeName,
        setGuid,
        setContentTypeName,
        goBack,
        viewContentTypeUsage
      )}
    </RouterContext.Provider>
  );
};

export default Router;

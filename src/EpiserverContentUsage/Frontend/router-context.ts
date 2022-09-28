import { createContext } from "react";

export const RouterContext = createContext({
  contentTypeName: "",
  setContentTypeName: (name: string) => {},
  guid: null,
  setGuid: (guid: string) => {},
  goBack: () => {},
  viewContentTypeUsage: (guid: string, name: string) => {},
});

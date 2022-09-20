import { createContext } from "react";

export const RouterContext = createContext({
  guid: null,
  setGuid: (guid: string) => {},
  goBack: () => {},
  viewContentTypeUsage: (guid: string) => {},
});

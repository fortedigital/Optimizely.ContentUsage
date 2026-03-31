import React, { createContext, useContext } from "react";
import { AppModel } from "../dtos";
import ContentUsageAPIClient from "../Lib/ContentUsageAPIClient";

const APIContext = createContext<ContentUsageAPIClient>(
  new ContentUsageAPIClient({
    contentTypeBases: null,
    contentType: null,
    contentTypes: null,
    contentUsages: null,
  })
);

interface APIProviderProps extends Omit<AppModel, "moduleBaseUrl"> {
  children?: React.ReactNode;
}

export default function APIProvider({
  children,
  ...endpoints
}: APIProviderProps) {
  const apiClient = new ContentUsageAPIClient({
    contentTypeBases: endpoints.contentTypeBasesEndpointUrl,
    contentType: endpoints.contentTypeEndpointUrl,
    contentTypes: endpoints.contentTypesEndpointUrl,
    contentUsages: endpoints.contentUsagesEndpointUrl,
  });

  return (
    <APIContext.Provider value={apiClient}>{children}</APIContext.Provider>
  );
}

export function useAPI() {
  return useContext(APIContext);
}

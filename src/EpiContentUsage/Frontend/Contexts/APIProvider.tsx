import React, { createContext, useContext } from "react";
import { AppModel } from "../dtos";
import EpiContentUsageAPIClient from "../Lib/EpiContentUsageAPIClient";

const APIContext = createContext<EpiContentUsageAPIClient>(null);

interface APIProviderProps extends Omit<AppModel, "moduleBaseUrl"> {
  children?: React.ReactNode;
}

export default function APIProvider({
  children,
  ...endpoints
}: APIProviderProps) {
  const apiClient = new EpiContentUsageAPIClient({
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

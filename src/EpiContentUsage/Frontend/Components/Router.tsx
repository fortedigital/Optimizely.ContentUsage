import React, { useCallback, useRef } from "react";
import {
  createHashRouter,
  createRoutesFromElements,
  LoaderFunctionArgs,
  redirect,
  Route,
  RouterProvider,
} from "react-router-dom";

import EpiContentUsageAPIClient from "../Lib/EpiContentUsageAPIClient";
import { routes, setBaseUrl } from "../routes";
import ContentTypesView from "../Views/ContentTypesView";
import ContentTypeUsageView from "../Views/ContentTypeUsageView";
import PageLoader from "./PageLoader";
import { useAPI } from "../Contexts/ApiProvider";

interface RouterProps {
  baseUrl: string;
}

interface LoadDataFunction {
  (
    apiClient: EpiContentUsageAPIClient,
    initialLoad: boolean,
    args: LoaderFunctionArgs
  ): Promise<any> | Response;
}

const contentTypesLoader: LoadDataFunction = (api) => api.getContentTypes();

const contentTypeUsagesLoader: LoadDataFunction = (
  api,
  initialLoad,
  { params }
) => {
  if (!params.guid) return redirect(routes.index);

  const contentTypeUsages = api.getContentTypeUsages(params.guid);

  if (initialLoad) {
    const contentType = api.getContentType(params.guid);

    return Promise.all([contentType, contentTypeUsages]);
  }

  return contentTypeUsages;
};

const Router = ({ baseUrl }: RouterProps) => {
  setBaseUrl(baseUrl);
  const initialLoadRef = useRef<boolean>(true);
  const api = useAPI();

  const loadData = useCallback(
    (apiClient: EpiContentUsageAPIClient, loaderFunction: LoadDataFunction) =>
      async (args: LoaderFunctionArgs) => {
        const data = await loaderFunction(
          apiClient,
          initialLoadRef.current,
          args
        );
        initialLoadRef.current = false;
        return data;
      },
    []
  );

  const router = createHashRouter(
    createRoutesFromElements(
      <>
        <Route
          path={routes.index}
          element={<ContentTypesView />}
          loader={loadData(api, contentTypesLoader)}
        />
        <Route
          path={routes.contentTypeUsages}
          element={<ContentTypeUsageView />}
          loader={loadData(api, contentTypeUsagesLoader)}
        >
          <Route
            path=":guid"
            element={<ContentTypeUsageView />}
            loader={loadData(api, contentTypeUsagesLoader)}
          />
        </Route>
      </>
    )
  );

  return <RouterProvider router={router} fallbackElement={<PageLoader />} />;
};

export default Router;

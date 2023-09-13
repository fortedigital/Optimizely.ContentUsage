import React, { useCallback, useRef } from "react";
import {
  createHashRouter,
  createRoutesFromElements,
  LoaderFunctionArgs,
  redirect,
  Route,
  RouterProvider,
} from "react-router-dom";

import ContentUsageAPIClient from "../Lib/ContentUsageAPIClient";
import { routes, setBaseUrl } from "../routes";
import ContentTypesView from "../Views/ContentTypesView";
import ContentTypeUsageView from "../Views/ContentTypeUsageView";
import PageLoader from "./PageLoader/PageLoader";
import { useAPI } from "../Contexts/ApiProvider";

interface RouterProps {
  baseUrl: string;
}

interface LoadDataFunction {
  (
    apiClient: ContentUsageAPIClient,
    args: LoaderFunctionArgs
  ): Promise<any> | Response;
}

const contentTypesLoader: LoadDataFunction = (api) => {
  const contentTypeBases = api.getContentTypeBases();
  const contentTypes = api.getContentTypes();

  return Promise.all([contentTypeBases, contentTypes]);
};

const contentTypeUsagesLoader: LoadDataFunction = (
  api,
  { request, params }
) => {
  if (!params.guid) return redirect(routes.index);

  const query = Object.fromEntries(new URL(request.url).searchParams.entries());

  const contentTypeUsages = api.getContentTypeUsages({
    guid: params.guid,
    ...query,
  });

  const contentType = api.getContentType(params.guid);

  return Promise.all([contentType, contentTypeUsages]);
};

const Router = ({ baseUrl }: RouterProps) => {
  setBaseUrl(baseUrl);
  const api = useAPI();

  const loadData = useCallback(
    (apiClient: ContentUsageAPIClient, loaderFunction: LoadDataFunction) =>
      async (args: LoaderFunctionArgs) => {
        const data = await loaderFunction(
          apiClient,
          args
        );
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
          path={`${routes.contentTypeUsages}/:guid?`}
          element={<ContentTypeUsageView />}
          loader={loadData(api, contentTypeUsagesLoader)}
        />
      </>
    )
  );

  return <RouterProvider router={router} fallbackElement={<PageLoader />} />;
};

export default Router;

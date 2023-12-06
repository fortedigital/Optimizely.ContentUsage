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
import { GetContentTypesQuery } from "../dtos";

interface RouterProps {
  baseUrl: string;
}

interface LoadDataFunction {
  (
    apiClient: ContentUsageAPIClient,
    initialLoad: boolean,
    args: LoaderFunctionArgs
  ): Promise<any> | Response;
}

const contentTypesLoader: LoadDataFunction = (
  api,
  initialLoad,
  { request }
) => {
  const contentTypeBases = api.getContentTypeBases();

  const typeRouteParamKey = "type";
  const searchParams = new URL(request.url).searchParams;
  const queryTypes = searchParams.getAll(typeRouteParamKey);
  searchParams.delete(typeRouteParamKey);
  const query = Object.fromEntries(
    searchParams
  ) as Partial<GetContentTypesQuery>;

  if (queryTypes.length) query.types = queryTypes;

  const contentTypes = api.getContentTypes(query);

  return Promise.all([contentTypeBases, contentTypes]);
};

const contentTypeUsagesLoader: LoadDataFunction = (
  api,
  initialLoad,
  { request, params }
) => {
  if (!params.guid) return redirect(routes.index);

  const query = Object.fromEntries(new URL(request.url).searchParams.entries());

  const contentTypeUsages = api.getContentTypeUsages({
    guid: params.guid,
    ...query,
  });

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
    (apiClient: ContentUsageAPIClient, loaderFunction: LoadDataFunction) =>
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

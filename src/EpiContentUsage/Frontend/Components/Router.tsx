import React, { useCallback, useRef } from "react";
import {
  createHashRouter,
  createRoutesFromElements,
  LoaderFunctionArgs,
  redirect,
  Route,
  RouterProvider,
} from "react-router-dom";
import { Api } from "../Lib/Api";
import { routes } from "../routes";
import { ContentType, ContentTypeUsage } from "../types";
import ContentTypesView from "../Views/ContentTypesView";
import ContentTypeUsageView from "../Views/ContentTypeUsageView";
import Loader from "./Loader";

interface RouterProps {
  baseUrl?: string;
}

interface LoadDataFunction {
  (initialLoad: boolean, args: LoaderFunctionArgs): Promise<any> | Response;
}

const contentTypesLoader: LoadDataFunction = () =>
  Api.get<ContentType[]>(Api.endpoints.contentTypesEndpointUrl);

const contentTypeUsagesLoader: LoadDataFunction = (initialLoad, { params }) => {
  if (!params.guid) return redirect(routes.index);
  const contentTypeUsages = Api.get<ContentTypeUsage[]>(
    Api.endpoints.contentUsagesEndpointUrl,
    {
      guid: params.guid,
    }
  );

  if (initialLoad) {
    const contentType = Api.get<ContentType>(
      Api.endpoints.contentTypeEndpointUrl,
      { guid: params.guid }
    );

    return Promise.all([contentType, contentTypeUsages]);
  }

  return contentTypeUsages;
};

const Router = ({ baseUrl }: RouterProps) => {
  const initialLoadRef = useRef<boolean>(true);

  const loadData = useCallback(
    (loaderFunction: LoadDataFunction) => async (args: LoaderFunctionArgs) => {
      const data = await loaderFunction(initialLoadRef.current, args);
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
          loader={loadData(contentTypesLoader)}
        />
        <Route
          path={routes.contentTypeUsages}
          element={<ContentTypeUsageView />}
          loader={loadData(contentTypeUsagesLoader)}
        >
          <Route
            path=":guid"
            element={<ContentTypeUsageView />}
            loader={loadData(contentTypeUsagesLoader)}
          />
        </Route>
      </>
    )
  );

  return <RouterProvider router={router} fallbackElement={<Loader />} />;
};

export default Router;

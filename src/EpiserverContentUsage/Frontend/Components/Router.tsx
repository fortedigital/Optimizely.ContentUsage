import React from "react";
import {
  createBrowserRouter,
  createRoutesFromElements,
  LoaderFunction,
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

const contentTypesLoader: LoaderFunction = () =>
  Api.get<ContentType[]>(Api.endpoints.getContentTypes);

const contentTypeUsagesLoader: LoaderFunction = ({ params }) => {
  if (!params.guid) redirect(routes.index);
  return Api.get<ContentTypeUsage[]>(Api.endpoints.getContentTypeUsages, {
    guid: params.guid,
  });
};

const Router = ({ baseUrl }: RouterProps) => {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <>
        <Route
          path={routes.index}
          element={<ContentTypesView />}
          loader={contentTypesLoader}
        />
        <Route
          path={routes.contentTypeUsages}
          element={<ContentTypeUsageView />}
          loader={contentTypeUsagesLoader}
        >
          <Route
            path=":guid"
            element={<ContentTypeUsageView />}
            loader={contentTypeUsagesLoader}
          />
        </Route>
      </>
    ),
    { basename: baseUrl }
  );

  return <RouterProvider router={router} fallbackElement={<Loader />} />;
};

export default Router;

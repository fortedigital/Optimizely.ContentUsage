import React from "react";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import { Api } from "../Lib/Api";
import { ContentType, ContentTypeUsage } from "../types";
import ContentTypesView from "../Views/ContentTypesView";
import ContentTypeUsageView from "../Views/ContentTypeUsageView";
import Loader from "./Loader";

interface RouterProps {
  baseUrl?: string;
}

const Router = ({ baseUrl }: RouterProps) => {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <>
        <Route
          path="/"
          element={<ContentTypesView />}
          loader={() => Api.get<ContentType[]>(Api.endpoints.getContentTypes)}
        />
        <Route
          path="/viewContentTypeUsages"
          element={<ContentTypeUsageView />}
          loader={({ params }) =>
            params.guid
              ? Api.get<ContentTypeUsage[]>(
                  Api.endpoints.getContentTypeUsages,
                  {
                    guid: params.guid,
                  }
                )
              : []
          }
        >
          <Route
            path=":guid"
            element={<ContentTypeUsageView />}
            loader={({ params }) =>
              Api.get<ContentTypeUsage[]>(Api.endpoints.getContentTypeUsages, {
                guid: params.guid,
              })
            }
          />
        </Route>
      </>
    ),
    { basename: baseUrl }
  );

  return <RouterProvider router={router} fallbackElement={<Loader />} />;
};

export default Router;

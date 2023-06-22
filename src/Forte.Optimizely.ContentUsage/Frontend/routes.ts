let baseUrl = ``;

export const setBaseUrl = (url: string) => (baseUrl = url);
export const getBaseUrl = () => baseUrl;

export const baseViewPath = `/MainView`;

export const routes = {
  index: `/`,
  contentTypeUsages: `/ViewContentTypeUsages`,
};

export const viewContentTypes = () => routes.index;
export const viewContentTypeUsages = (guid: string) =>
  `${routes.contentTypeUsages}/${guid}`;

export const removeTrailingSlash = (url: string) => url.replace(/\/$/, "");

export const getRoutePath = (route: string) =>
  removeTrailingSlash(getBaseUrl()) + baseViewPath + "#" + route;

export const navigateTo = (url: string | URL) => {
  if (typeof window !== "undefined") {
    window.location.assign(url);
  }
};

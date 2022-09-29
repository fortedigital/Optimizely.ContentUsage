export const routes = {
  index: `/MainView`,
  contentTypeUsages: `/ViewContentTypeUsages`,
};

export const viewContentTypes = () => routes.index;
export const viewContentTypeUsages = (guid: string) =>
  `${routes.contentTypeUsages}/${guid}`;

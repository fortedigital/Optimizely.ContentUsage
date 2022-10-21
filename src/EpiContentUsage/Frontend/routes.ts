export const routes = {
  index: `/`,
  contentTypeUsages: `/ViewContentTypeUsages`,
};

export const viewContentTypes = () => routes.index;
export const viewContentTypeUsages = (guid: string) =>
  `${routes.contentTypeUsages}/${guid}`;

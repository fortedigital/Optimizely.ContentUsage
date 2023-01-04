// Ideally this should come from backend
export const translations = {
  title: "Content Usage",
  filters: {
    showColumns: "Show columns",
    all: "All",
    mixed: "Mixed",
    numberOfRows: "Number of rows",
    search: "Search",
  },
  views: {
    contentTypesView: {
      table: {
        columns: {
          guid: "GUID",
          displayName: "Display name",
          name: "Name",
          type: "Type",
          usageCount: "Usage count",
        },
        actions: {
          title: "Actions",
          viewUsages: "View usages",
          copyGuid: "Copy GUID",
        },
      },
    },
    contentUsagesView: {
      table: {
        columns: {
          id: "ID",
          contentTypeGuid: "GUID",
          displayName: "Display name",
          name: "Name",
          languageBranch: "Language",
          pageUrl: "URL",
        },
        actions: {
          edit: "Edit",
        },
      },
    },
  },
  noResults: "No matching results",
};

// Ideally this should come from backend
export const translations = {
  title: "Content Usage",
  filters: {
    contentTypes: "Content types",
    showColumns: "Show columns",
    all: "All",
    mixed: "Mixed",
    numberOfRows: "Number of rows",
    search: "Search",
    none: "None",
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
          statistics: "Statistics",
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
          displayName: "Display name",
          name: "Name",
          languageBranch: "Language",
          pageUrl: "URL",
        },
        actions: {
          title: "Actions",
          edit: "Edit",
          view: "View",
        },
      },
    },
  },
  noResults: "No matching results",
};

import React, { useMemo } from "react";
import { Dropdown } from "optimizely-oui";
import { TableColumn } from "../../types";
import { useTranslations } from "../../Contexts/TranslationsProvider";

interface ColumnsFilterProps<TableDataType> {
  columns: TableColumn<TableDataType>[];
  onChange?: (column: keyof TableDataType, visible: boolean) => void;
}

function ColumnsFilter<TableDataType>({
  columns,
  onChange,
}: ColumnsFilterProps<TableDataType>) {
  const translations = useTranslations();

  const dropdownContent = useMemo(() => {
    const filteredColumns = columns.filter((column) => column.visible);

    if (filteredColumns.length === columns.length)
      return translations.filters.all;
    if (filteredColumns.length === 1) return filteredColumns[0].name;

    return translations.filters.mixed;
  }, [columns, translations]);

  const isAllSelected = columns.every((c) => c.visible);

  return (
    <Dropdown
      arrowIcon="down"
      buttonContent={{
        label: translations.filters.showColumns,
        content: dropdownContent,
      }}
      style="plain"
      shouldHideChildrenOnClick={false}
    >
      <Dropdown.Contents>
        <Dropdown.ListItem key="All">
          <Dropdown.BlockLink
            isItemSelected={isAllSelected}
            isMultiSelect={true}
            onClick={
              onChange
                ? () => {
                    columns.forEach((c) => {
                      onChange(c.id, !isAllSelected);
                    });
                  }
                : undefined
            }
          >
            <Dropdown.BlockLinkText text="All" />
          </Dropdown.BlockLink>
        </Dropdown.ListItem>
        {columns.map(({ id, name, visible }) => (
          <Dropdown.ListItem key={name}>
            <Dropdown.BlockLink
              isItemSelected={visible}
              isMultiSelect={true}
              onClick={onChange ? () => onChange(id, !visible) : undefined}
            >
              <Dropdown.BlockLinkText text={name} />
            </Dropdown.BlockLink>
          </Dropdown.ListItem>
        ))}
      </Dropdown.Contents>
    </Dropdown>
  );
}

export default ColumnsFilter;

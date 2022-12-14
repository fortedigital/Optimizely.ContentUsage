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
    if (filteredColumns.length === 1) return filteredColumns[0].value;

    return translations.filters.mixed;
  }, [columns, translations]);

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
        {columns.map(({ name, value, visible }) => (
          <Dropdown.ListItem key={name}>
            <Dropdown.BlockLink
              isItemSelected={visible}
              isMultiSelect={true}
              onClick={onChange ? () => onChange(name, !visible) : undefined}
              isDisabled={visible && columns.length === 1}
            >
              <Dropdown.BlockLinkText text={value} />
            </Dropdown.BlockLink>
          </Dropdown.ListItem>
        ))}
      </Dropdown.Contents>
    </Dropdown>
  );
}

export default ColumnsFilter;

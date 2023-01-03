import React from "react";
import { Dropdown } from "optimizely-oui";
import { useTranslations } from "../../Contexts/TranslationsProvider";

export const ROWS_PER_PAGE_DEFAULT_OPTIONS = [50, 100, 200];

interface NumberOfRowsFilterProps {
  selected: number;
  rowsPerPageOptions: number[];
  onChange?: (numberOfRows: number) => void;
}

const NumberOfRowsFilter = ({
  selected,
  rowsPerPageOptions = ROWS_PER_PAGE_DEFAULT_OPTIONS,
  onChange,
}: NumberOfRowsFilterProps) => {
  const translations = useTranslations();

  return (
    <Dropdown
      arrowIcon="down"
      buttonContent={{
        label: translations.filters.numberOfRows,
        content: selected.toString(),
      }}
      style="plain"
    >
      <Dropdown.Contents>
        {rowsPerPageOptions.map((option) => (
          <Dropdown.ListItem key={option}>
            <Dropdown.BlockLink
              onClick={onChange ? () => onChange(option) : undefined}
            >
              <Dropdown.BlockLinkText
                isItemSelected={option === selected}
                text={option}
              />
            </Dropdown.BlockLink>
          </Dropdown.ListItem>
        ))}
      </Dropdown.Contents>
    </Dropdown>
  );
};

export default NumberOfRowsFilter;

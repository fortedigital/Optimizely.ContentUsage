import { Input } from "optimizely-oui";
import React from "react";
import { useTranslations } from "../../Contexts/TranslationsProvider";

interface SearchInputProps {
  value?: string;
  onChange?: (...args: any[]) => any;
  onClearButtonClick?: (...args: any[]) => any;
}

const SearchInput = ({
  value,
  onChange,
  onClearButtonClick,
}: SearchInputProps) => {
  const translations = useTranslations();

  return (
    <Input
      displayError={false}
      hasClearButton={value?.length !== 0}
      hasSpellCheck={false}
      isFilter={false}
      isRequired={false}
      leftIconName="search"
      onChange={onChange}
      onClearButtonClick={onClearButtonClick}
      placeholder={translations.filters.search}
      type="text"
      value={value}
    />
  );
};

export default SearchInput;

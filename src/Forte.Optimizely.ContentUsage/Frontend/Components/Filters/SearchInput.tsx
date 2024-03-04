import { Input } from "optimizely-oui";
import React, { useEffect, useRef } from "react";
import { useTranslations } from "../../Contexts/TranslationsProvider";

interface SearchInputProps {
  value?: string;
  onChange?: (...args: any[]) => any;
  onClearButtonClick?: (...args: any[]) => any;
  disabled?: boolean;
}

const SearchInput = ({
  value,
  onChange,
  onClearButtonClick,
  disabled
}: SearchInputProps) => {
  const translations = useTranslations();

  const inputRef = useRef<HTMLInputElement>();

  useEffect(() => {
    if (!disabled){
      inputRef.current.focus();
    }
  }, [disabled])

  return (
    <Input
      ref={inputRef}
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
      isDisabled={disabled}
    />
  );
};

export default SearchInput;

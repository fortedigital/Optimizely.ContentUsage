import React, { useMemo } from "react";
import { Dropdown } from "optimizely-oui";
import { ContentTypeBase } from "../../types";
import { useTranslations } from "../../Contexts/TranslationsProvider";

interface ContentTypeBasesFilterProps {
  contentTypeBases: ContentTypeBase[];
  onChange?: (contentTypeBase: ContentTypeBase, selectAll?: boolean) => void;
  disabled?: boolean;
}

function ContentTypeBasesFilter({
  contentTypeBases,
  onChange,
  disabled,
}: ContentTypeBasesFilterProps) {
  const translations = useTranslations();

  const dropdownContent = useMemo(() => {
    const filteredContentTypeBases = contentTypeBases.filter(
      (contentTypeBase) => contentTypeBase.visible
    );

    if (filteredContentTypeBases.length === contentTypeBases.length)
      return translations.filters.all;
    if (filteredContentTypeBases.length === 1)
      return filteredContentTypeBases[0].name;
    if (filteredContentTypeBases.length > 1) return translations.filters.mixed;

    return translations.filters.none;
  }, [contentTypeBases, translations]);

  const isAllSelected = contentTypeBases.every((c) => c.visible);

  return (
    <Dropdown
      arrowIcon="down"
      buttonContent={{
        label: translations.filters.contentTypes,
        content: dropdownContent,
      }}
      style="plain"
      shouldHideChildrenOnClick={false}
      isDisabled={disabled}
    >
      <Dropdown.Contents>
        <Dropdown.ListItem key="All/None">
          <Dropdown.BlockLink
            isItemSelected={isAllSelected}
            isMultiSelect={true}
            onClick={
              onChange
                ? () => {
                    contentTypeBases.forEach((c) => {
                      onChange(c, !isAllSelected);
                    });
                  }
                : undefined
            }
          >
            <Dropdown.BlockLinkText text={translations.filters.all} />
          </Dropdown.BlockLink>
        </Dropdown.ListItem>
        {contentTypeBases.map((contentTypeBase) => (
          <Dropdown.ListItem key={contentTypeBase.name}>
            <Dropdown.BlockLink
              isItemSelected={contentTypeBase.visible}
              isMultiSelect={true}
              onClick={onChange ? () => onChange(contentTypeBase) : undefined}
            >
              <Dropdown.BlockLinkText text={contentTypeBase.name} />
            </Dropdown.BlockLink>
          </Dropdown.ListItem>
        ))}
      </Dropdown.Contents>
    </Dropdown>
  );
}

export default ContentTypeBasesFilter;

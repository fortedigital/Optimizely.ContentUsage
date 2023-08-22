import React, { FC } from "react";
import { Checkbox } from "optimizely-oui";
import { useTranslations } from "../../Contexts/TranslationsProvider";

interface IncludeDeletedFilterProps {
  includeDeleted?: boolean;
  onIncludeDeletedChange?: React.ChangeEventHandler<HTMLInputElement>;
}

const IncludeDeletedFilter: FC<IncludeDeletedFilterProps> = ({
  includeDeleted,
  onIncludeDeletedChange,
}) => {
    const translations = useTranslations();

  return (
    <div className="oui-dropdown-group">
        <Checkbox label={translations.filters.includeDeleted} checked={includeDeleted} onChange={onIncludeDeletedChange} />
    </div>
  );
};

export default IncludeDeletedFilter;

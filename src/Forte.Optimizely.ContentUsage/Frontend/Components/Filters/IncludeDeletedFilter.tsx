import React, { FC } from "react";
import { useTranslations } from "../../Contexts/TranslationsProvider";
import Checkbox from "../Form/Checkbox/Checkbox";
import classNames from "classnames";
import { classNamePrefix } from "../../Utils/styles";

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
    <div className={classNames('oui-dropdown-group', classNamePrefix('filter-checkbox-container'))}>
      <Checkbox
        checked={includeDeleted}
        onChange={onIncludeDeletedChange}
      >
        {translations.filters.includeDeleted}
      </Checkbox>
    </div>
  );
};

export default IncludeDeletedFilter;

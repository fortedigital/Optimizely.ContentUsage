import React, { ChangeEvent, ReactNode } from 'react';
import { Checkbox as OuiCheckbox } from 'optimizely-oui';
import classNames from 'classnames';
import { classNamePrefix } from '../../../Utils/styles';

import './Checkbox.scss';

interface CheckboxProps {
  checked?: boolean;
  className?: string;
  defaultChecked?: boolean;
  isDisabled?: boolean;
  children?: ReactNode;
  labelWeight?: string;
  description?: string;
  indeterminate?: boolean;
  onChange?: (event: ChangeEvent) => void;
}

const Checkbox = ({ className, children, ...props }: CheckboxProps) => {
  return (
    <OuiCheckbox
      {...props}
      className={classNames(classNamePrefix('checkbox'), className)}
      label={children}
    />
  );
};

export default Checkbox;

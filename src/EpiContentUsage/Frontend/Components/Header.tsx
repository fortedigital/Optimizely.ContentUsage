import React from "react";
import { Typography } from "optimizely-oui";

interface HeaderProps {
  title: string;
}

const Header = ({ title }: HeaderProps) => {
  return (
    <div className="epi-main-header">
      <Typography type="header4" tag="h2">
        {title}
      </Typography>
    </div>
  );
};

export default Header;

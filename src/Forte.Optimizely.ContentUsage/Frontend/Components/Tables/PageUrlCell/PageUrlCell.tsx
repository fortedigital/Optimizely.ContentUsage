import { Disclose } from "optimizely-oui";
import React from "react";
import PageUrlLink from "./PageUrlLink/PageUrlLink";
import { HoverHandlers } from "../../../Lib/hooks/useHoverTrackingHandlers";
import { UsagePageDto } from "../../../dtos";

interface PageUrlCellProps {
  pages: UsagePageDto[];
  urlHoveredHandlers: HoverHandlers;
}

const PageUrlCell = ({ pages, urlHoveredHandlers }: PageUrlCellProps) => {
  const isManyUrls = pages.length > 1;

  return isManyUrls ? (
    <Disclose title="Many usages">
      {pages.map((page, index) => (
        <PageUrlLink
          key={index}
          page={page}
          urlHoveredHandlers={urlHoveredHandlers}
        />
      ))}
    </Disclose>
  ) : (
    <>
      <PageUrlLink page={pages[0]} urlHoveredHandlers={urlHoveredHandlers} />
    </>
  );
};

export default PageUrlCell;

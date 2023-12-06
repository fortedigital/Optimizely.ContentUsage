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
      <ul className="forte-optimizely-content-usage-page-urls">
        {pages.map((page, index) => (
          <li>
            <PageUrlLink
              key={index}
              page={page}
              urlHoveredHandlers={urlHoveredHandlers}
            />
          </li>
        ))}
      </ul>
    </Disclose>
  ) : (
    <>
      <PageUrlLink page={pages[0]} urlHoveredHandlers={urlHoveredHandlers} />
    </>
  );
};

export default PageUrlCell;

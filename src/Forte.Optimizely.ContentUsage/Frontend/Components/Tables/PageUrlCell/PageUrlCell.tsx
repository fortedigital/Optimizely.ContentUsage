import { Disclose } from "optimizely-oui";
import React, { useCallback } from "react";
import PageUrlLink from "./PageUrlLink/PageUrlLink";
import { HoverHandlers } from "../../../Lib/hooks/useHoverTrackingHandlers";

interface PageUrlCellProps {
  pageUrls: string[];
  urlHoveredHandlers: HoverHandlers;
}

const PageUrlCell = ({pageUrls,urlHoveredHandlers}: PageUrlCellProps) => {
  const isManyUrls = pageUrls.length > 1;

  const discloseHeaderClickHandler = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  return isManyUrls ? (
    <div onClick={discloseHeaderClickHandler}>
      <Disclose title="Many usages">
        {pageUrls.map((pageUrl, index) => (
          <PageUrlLink key={index} pageUrl={pageUrl} urlHoveredHandlers={urlHoveredHandlers}/>
        ))}
      </Disclose>
    </div>
  ) : (
    <PageUrlLink pageUrl={pageUrls[0]} urlHoveredHandlers={urlHoveredHandlers}/>
  );
}

export default PageUrlCell;

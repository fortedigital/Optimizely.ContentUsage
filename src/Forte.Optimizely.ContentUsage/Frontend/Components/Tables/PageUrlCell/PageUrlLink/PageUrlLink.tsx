import { Link } from "optimizely-oui";
import React from "react";
import { HoverHandlers } from "../../../../Lib/hooks/useHoverTrackingHandlers";
import { UsagePageDto } from "../../../../dtos";

interface PageUrlLinkProps {
  page: UsagePageDto;
  urlHoveredHandlers: HoverHandlers;
}

const PageUrlLink = ({ page, urlHoveredHandlers }: PageUrlLinkProps) => {
  return (
    <>
      <Link href={page.url} newWindow>
        <div
          className="forte-optimizely-content-usage-page-url"
          onMouseEnter={urlHoveredHandlers.enter}
          onMouseLeave={urlHoveredHandlers.out}
        >
          {page.url}
        </div>
      </Link>
      {`(${page.pageType})`}
    </>
  );
};

export default PageUrlLink;

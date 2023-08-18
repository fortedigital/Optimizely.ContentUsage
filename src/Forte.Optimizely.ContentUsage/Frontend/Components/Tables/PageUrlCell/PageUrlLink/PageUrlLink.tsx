import { Link } from "optimizely-oui";
import React from "react";
import { HoverHandlers } from "../../../../Lib/hooks/useHoverTrackingHandlers";

interface PageUrlLinkProps {
  pageUrl: string;
  urlHoveredHandlers: HoverHandlers;
}

const PageUrlLink = ({ pageUrl, urlHoveredHandlers }: PageUrlLinkProps) => {
  return (
    <Link href={pageUrl} newWindow>
      <div
        className="forte-optimizely-content-usage-page-url"
        onMouseEnter={urlHoveredHandlers.enter}
        onMouseLeave={urlHoveredHandlers.out}>
        {pageUrl}
      </div>
    </Link>
  );
};

export default PageUrlLink;
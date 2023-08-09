import { Link } from "optimizely-oui";
import React from "react";

const PageUrlLink = ({ pageUrl }: { pageUrl: string }) => {
    return (
      <Link href={pageUrl} newWindow>
        <div className="forte-optimizely-content-usage-page-url">{pageUrl}</div>
      </Link>
    );
  };

export default PageUrlLink;
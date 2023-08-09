import { Disclose } from "optimizely-oui";
import React from "react";
import PageUrlLink from "./PageUrlLink/PageUrlLink";

const PageUrlCell = ({pageUrls}:{pageUrls: string[]}) => {
    const isManyUrls = pageUrls.length > 1;
  
    return isManyUrls ? (
      <Disclose title="Many usages">
        {pageUrls.map((pageUrl, index) => (
          <PageUrlLink key={index} pageUrl={pageUrl}/>
        ))}
      </Disclose>
    ) : (
      <PageUrlLink pageUrl={pageUrls[0]}/>
    );
  }

  export default PageUrlCell;
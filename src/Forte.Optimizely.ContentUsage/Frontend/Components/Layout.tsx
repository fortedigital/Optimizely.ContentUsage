import React from "react";
import { ContentArea, Workspace } from "@episerver/ui-framework";

interface LayoutProps {
  children?: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => (
  <div className="content-area-container">
    <ContentArea>
      <Workspace>{children}</Workspace>
    </ContentArea>
  </div>
);

export default Layout;

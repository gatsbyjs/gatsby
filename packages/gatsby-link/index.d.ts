import * as React from "react";

export interface GatsbyLinkProps {
  to: string;
  onClick?: (event: any) => void
}

export default class GatsbyLink extends React.Component<GatsbyLinkProps, void> { }

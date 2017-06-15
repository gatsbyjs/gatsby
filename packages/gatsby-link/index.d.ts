import * as React from "react";

export interface GatsbyLinkProps {
  to: string;
  onClick?: (event: any) => void
}

export default class GatbyLink extends React.Component<GatsbyLinkProps, void>;
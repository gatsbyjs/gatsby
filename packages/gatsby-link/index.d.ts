import * as React from "react";
import { NavLinkProps } from "react-router-dom";

export interface GatsbyLinkProps extends NavLinkProps {
  to: string;
  onClick?: (event: any) => void
}

export default class GatsbyLink extends React.Component<GatsbyLinkProps> { }

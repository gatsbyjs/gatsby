import * as React from "react";
import { NavLinkProps } from "react-router-dom";

export interface GatsbyLinkProps extends NavLinkProps {
  to: string;
  onClick?: (event: any) => void
}

export const navigateTo: (path: string) => void;

export const withPrefix: (path: string) => string;

export default class GatsbyLink extends React.Component<GatsbyLinkProps> { }

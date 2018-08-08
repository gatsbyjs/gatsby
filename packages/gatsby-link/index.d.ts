import * as React from "react";

export const push: (to: string) => void;
export const replace: (to: string) => void;

// TODO: Remove navigateTo for Gatsby v3
export const navigateTo: (to: string) => void;

export const withPrefix: (path: string) => string;

export interface GatsbyLinkProps extends NavLinkProps {
  onClick?: (event: any) => void;
  innerRef?: (instance: any) => void;
  className?: string;
  activeClassName?: string;
  style?: { [key: string]: any };
  activeStyle?: { [key: string]: any };
  to: string;
}

export default class GatsbyLink extends React.Component<GatsbyLinkProps, any> {}

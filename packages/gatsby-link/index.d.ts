import * as React from "react";
import { NavLinkProps } from "react-router-dom";
import { LocationDescriptor } from "history";

export interface GatsbyLinkProps extends NavLinkProps {
  onClick?: (event: any) => void
  className?: string
  style?:any;
}

export const navigateTo: (to: LocationDescriptor) => void;

export const withPrefix: (path: string) => string;

export default class GatsbyLink extends React.Component<GatsbyLinkProps, any> { }

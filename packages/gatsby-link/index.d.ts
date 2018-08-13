import * as React from "react";
import { NavigateOptions, LinkProps, NavigateFn } from "@reach/router";

export interface GatsbyLinkProps<TState = {}> extends LinkProps<TState> {}

export const navigate: NavigateFn;

// TODO: Remove these three functions for Gatsby v3
export const push: (to: string) => void;
export const replace: (to: string) => void;
export const navigateTo: (to: string) => void;

export const withPrefix: (path: string) => string;

export default class GatsbyLink extends React.Component<GatsbyLinkProps, any> { }

import * as React from "react";

export const push: (to: LocationDescriptor) => void;
export const replace: (to: LocationDescriptor) => void;

// TODO: Remove navigateTo for Gatsby v3
export const navigateTo: (to: LocationDescriptor) => void;

export const withPrefix: (path: string) => string;

export default class GatsbyLink extends React.Component<GatsbyLinkProps, any> { }

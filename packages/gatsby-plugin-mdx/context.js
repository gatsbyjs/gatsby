/* eslint-disable */
import React, { createContext } from "react";

const GatsbyMDXScopeContext = createContext({});

export const withMDXScope = Component => ({ scope, ...props }) => (
  <GatsbyMDXScopeContext.Consumer>
    {contextScope => <Component scope={scope || contextScope} {...props} />}
  </GatsbyMDXScopeContext.Consumer>
);

export const MDXScopeProvider = ({ __mdxScope, children }) => (
  <GatsbyMDXScopeContext.Provider value={__mdxScope}>
    {children}
  </GatsbyMDXScopeContext.Provider>
);

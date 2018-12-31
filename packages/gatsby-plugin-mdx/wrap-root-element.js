import React from "react";
import { MDXScopeProvider } from "./context";
import scopeContexts from "./loaders/mdx-scopes!";

const WrapRootElement = ({ element }) => {
  return (
    <MDXScopeProvider __mdxScope={scopeContexts}>{element}</MDXScopeProvider>
  );
};

export default WrapRootElement;

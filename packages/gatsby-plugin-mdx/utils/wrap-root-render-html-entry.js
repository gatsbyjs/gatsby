/* global __MDX_CONTENT__ */
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import scopeContexts from "../loaders/mdx-scopes!";
import MDXRenderer from "../mdx-renderer";

export default () =>
  renderToStaticMarkup(
    <MDXRenderer scope={scopeContexts} isHTMLRenderPass>
      {__MDX_CONTENT__}
    </MDXRenderer>
  );

/* global __MDX_CONTENT__ */
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import scopeContexts from "../loaders/mdx-scopes";
import MDXRenderer from "../mdx-renderer";
import { plugins as wrappers } from "../loaders/mdx-wrappers";
import { pipe } from "lodash/fp";

export default () => {
  return renderToStaticMarkup(
    pipe(wrappers.map(w => w.wrapRootElement))(
      <MDXRenderer scope={scopeContexts} isHTMLRenderPass>
        {__MDX_CONTENT__}
      </MDXRenderer>
    )
  );
};

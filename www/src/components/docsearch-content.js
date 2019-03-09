import React from "react"

export default ({ children }) => (
  // todo settle on one className to facilitate Algolia DocSearch;
  // `post` and `post-body` are only in use for the blog:
  // https://github.com/algolia/docsearch-configs/blob/6c2fd2d71302e3ead9a0a83dd44dca02ae0701e3/configs/gatsbyjs.json#L66-L77
  <main id={`reach-skip-nav`} className={`docSearch-content post post-body`}>
    {children}
  </main>
)

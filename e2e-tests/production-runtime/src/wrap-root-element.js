import * as React from "react"
import { StaticQuery, graphql, Script } from "gatsby"
import { scripts } from "../gatsby-script-scripts"

export default ({ element }) => {
  return (
    <StaticQuery
      query={graphql`
        query MetaQuery {
          site {
            siteMetadata {
              title
            }
          }
        }
      `}
      render={({
        site: {
          siteMetadata: { title },
        },
      }) => (
        <>
          {element}
          <Script src={scripts.jQuery} strategy="post-hydrate" />
          <Script src={scripts.popper} strategy="idle" />
          <div>
            StaticQuery in wrapRootElement test (should show site title):
            <span data-testid="wrap-root-element-result">{title}</span>
          </div>
        </>
      )}
    />
  )
}

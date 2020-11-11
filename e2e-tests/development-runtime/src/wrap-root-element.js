import React from "react"
import { StaticQuery, graphql } from "gatsby"

const WrapRootElement = ({ element }) => (
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
        <div>
          StaticQuery in wrapRootElement test (should show site title):
          <span data-testid="wrap-root-element-result">{title}</span>
        </div>
      </>
    )}
  />
)

export default WrapRootElement

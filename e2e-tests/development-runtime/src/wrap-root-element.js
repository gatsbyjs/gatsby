import React from "react"
import { StaticQuery, graphql, Script } from "gatsby"
import { scripts } from "../gatsby-script-scripts"
import { AppContextProvider } from "./app-context"

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
      <AppContextProvider>
        {element}
        <Script src={scripts.jQuery} strategy="post-hydrate" />
        <Script src={scripts.popper} strategy="idle" />
        <div>
          StaticQuery in wrapRootElement test (should show site title):
          <span data-testid="wrap-root-element-result">{title}</span>
          <div data-testid="gatsby-browser-hmr">
            %TEST_HMR_IN_GATSBY_BROWSER%
          </div>
        </div>
      </AppContextProvider>
    )}
  />
)

export default WrapRootElement

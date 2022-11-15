import * as React from "react"
import { StaticQuery, graphql, Script } from "gatsby"
import { scripts } from "../gatsby-script-scripts"
import { ContextForSlicesProvider } from "./context-for-slices"
import { WrapRootContext } from "./wrap-root-context"

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
        <ContextForSlicesProvider>
          <WrapRootContext.Provider value={{ title }}>
            {element}
            <Script src={scripts.jQuery} strategy="post-hydrate" />
            <Script src={scripts.popper} strategy="idle" />
          </WrapRootContext.Provider>
        </ContextForSlicesProvider>
      )}
    />
  )
}

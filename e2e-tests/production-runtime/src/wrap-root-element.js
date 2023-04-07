import * as React from "react"
import { StaticQuery, graphql, Script } from "gatsby"
import { scripts } from "../gatsby-script-scripts"
import { AppContextProvider } from "./app-context"
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
        <AppContextProvider>
          {/* Instead of adding UI markup here, we just set provider
          and actual UI is rendered in wrapPageElement. WrapRootElement
          should never create UI elements as it will cause problems
          for slices - it should only setup providers or components
          resulting in side effects (for example Script components) */}
          <WrapRootContext.Provider value={{ title }}>
            {element}
            <Script src={scripts.jQuery} strategy="post-hydrate" />
            <Script src={scripts.popper} strategy="idle" />
          </WrapRootContext.Provider>
        </AppContextProvider>
      )}
    />
  )
}

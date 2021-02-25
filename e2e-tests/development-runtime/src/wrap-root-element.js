import React from "react"
import { StaticQuery, graphql } from "gatsby"

const Wat = ({ element }, ...args) => {
  console.log(`re-render`, args)
  return (
    <>
      {/* <StaticQuery
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
      /> */}
      {element}
      <div data-testid="gatsby-browser-hmr">
        aHMR_IN_GATSBY_BROWSER_WORKS9xzzzvaaddadsabgg
      </div>
    </>
  )
}
export default Wat
// export { WrapRootElement }

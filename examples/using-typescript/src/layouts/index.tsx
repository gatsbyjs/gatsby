import * as React from "react"
import { OutboundLink } from "gatsby-plugin-google-analytics"

import { rhythm } from "../utils/typography"

const MainLayout: React.SFC = ({ children }) => (
  <div
    style={{
      margin: `0 auto`,
      marginBottom: rhythm(1.5),
      marginTop: rhythm(1.5),
      maxWidth: 650,
      paddingLeft: rhythm(3 / 4),
      paddingRight: rhythm(3 / 4),
    }}
  >
    <OutboundLink
      onClick={e => {
        e.preventDefault()
      }}
    />
    {children}
  </div>
)

export default MainLayout

import * as React from "react"

import { rhythm } from "../utils/typography"

const MainLayout = ({ children }: { children: any }) => (
  <div
    style={{
      margin: `0 auto`,
      marginTop: rhythm(1.5),
      marginBottom: rhythm(1.5),
      maxWidth: 650,
      paddingLeft: rhythm(3 / 4),
      paddingRight: rhythm(3 / 4),
    }}
  >
    {children}
  </div>
)

export default MainLayout

import React from "react"
import { Grid } from "@chakra-ui/core"

function Layout({ children }) {
  return (
    <div>
      <Grid style={{ margin: `0 auto` }} maxW="90%" w={900} alignSelf="center">
        {children}
      </Grid>
    </div>
  )
}

export default Layout

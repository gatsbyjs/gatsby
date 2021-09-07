/** @jsx jsx */
import { jsx } from "theme-ui"
import { Flex } from "strict-ui"
import { Helmet } from "react-helmet"
import Providers from "./providers"
import Navbar from "./navbar"
import { PageviewTracker } from "./pageview-tracker"
import { ReactNode } from "react"

function Layout({ children }: { children: ReactNode }): JSX.Element {
  return (
    <Providers>
      <Helmet>
        <title>Gatsby Admin</title>
        <html lang="en" />
      </Helmet>
      <PageviewTracker />
      <Flex
        gap={0}
        flexDirection="column"
        sx={{
          maxWidth: `76rem`,
          margin: `0 auto`,
          px: 8,
        }}
      >
        <Navbar />
        <main>{children}</main>
      </Flex>
    </Providers>
  )
}

export default Layout

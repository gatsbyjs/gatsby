/** @jsx jsx */
import { jsx } from "theme-ui"
import { Flex } from "strict-ui"
import { Helmet } from "react-helmet"
import telemetry from "gatsby-telemetry"
import pkgJson from "../../package.json"
import Providers from "./providers"
import Navbar from "./navbar"

telemetry.setDefaultComponentId(`gatsby-admin`)
telemetry.setGatsbyCliVersion(pkgJson.version)

function Layout({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <Providers>
      <Helmet>
        <title>Gatsby Admin</title>
        <html lang="en" />
      </Helmet>
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

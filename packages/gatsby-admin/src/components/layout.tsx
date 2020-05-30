/** @jsx jsx */
import { jsx, Flex } from "strict-ui"
import Providers from "./providers"
import Navbar from "./navbar"
import { Helmet } from "react-helmet"

const Layout: React.FC<{}> = ({ children }) => (
  <Providers>
    <Helmet>
      <title>Gatsby Admin</title>
      <html lang="en" />
    </Helmet>
    <Flex gap={0} flexDirection="column">
      <Navbar />
      <main>{children}</main>
    </Flex>
  </Providers>
)

export default Layout

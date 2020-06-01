/** @jsx jsx */
import { jsx, Flex } from "strict-ui"
import Providers from "./providers"
import Navbar from "./navbar"

const Layout: React.FC<{}> = ({ children }) => (
  <Providers>
    <Flex gap={0} flexDirection="column">
      <Navbar />
      {children}
    </Flex>
  </Providers>
)

export default Layout

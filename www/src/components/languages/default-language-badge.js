/** @jsx jsx */
import { jsx } from "theme-ui"
import styled from "@emotion/styled"

import MdCheckCircle from "react-icons/lib/md/check-circle"

const Text = styled.span`
  color: ${p => p.theme.colors.link.color};
`

const DefaultLanguageBadge = ({ children }) => (
  <Text>
    <MdCheckCircle /> {children}
  </Text>
)

export default DefaultLanguageBadge

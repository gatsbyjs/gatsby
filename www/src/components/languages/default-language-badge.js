/** @jsx jsx */
import { jsx } from "theme-ui"
import styled from "@emotion/styled"

import { MdCheckCircle as CheckCircleIcon } from "react-icons/md"

const Text = styled.span`
  color: ${p => p.theme.colors.link.color};
`

const DefaultLanguageBadge = ({ children }) => (
  <Text>
    <CheckCircleIcon /> {children}
  </Text>
)

export default DefaultLanguageBadge

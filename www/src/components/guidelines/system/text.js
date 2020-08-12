import styled from "@emotion/styled"
import shouldForwardProp from "@styled-system/should-forward-prop"

import { Box } from "theme-ui"

const Text = styled(Box, { shouldForwardProp })()

Text.defaultProps = { color: `text` }

export default Text

import styled from "@emotion/styled"

import Box from "./box"

const themed = key => props => props.theme[key]

const Link = styled(Box)(themed(`Link`))

Link.defaultProps = {
  as: `a`,
  color: `purple.50`,
}

export default Link

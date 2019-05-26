import styled from "@emotion/styled"
import {
  order,
  flexWrap,
  flexDirection,
  alignItems,
  justifyContent,
} from "styled-system"

import Box from "./box"

const Flex = styled(Box)(
  {
    display: `flex`,
  },
  alignItems,
  justifyContent,
  order,
  flexDirection,
  flexWrap
)

Flex.propTypes = {
  ...alignItems.propTypes,
  ...flexDirection.propTypes,
  ...flexWrap.propTypes,
  ...justifyContent.propTypes,
  ...order.propTypes,
}

export default Flex

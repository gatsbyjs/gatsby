import styled from "@emotion/styled"
import { flexbox } from "styled-system"
import propTypes from "@styled-system/prop-types"

import Box from "./box"

const Flex = styled(Box)({ display: `flex` }, flexbox)

Flex.propTypes = { ...propTypes.flexbox }

export default Flex

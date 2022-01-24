import React from "react"
import IndicatorButton from "./IndicatorButton"
import { gatsbyIcon } from "../icons"

const getButtonProps = ({ buttonIndex }) => {
  const baseProps = {
    testId: `gatsby`,
    buttonIndex,
    iconSvg: gatsbyIcon,
    active: true,
  }
  return baseProps
}

const GatsbyIndicatorButton = props => (
  <IndicatorButton {...getButtonProps(props)} />
)

export default GatsbyIndicatorButton

import React from "react"
import IndicatorButton from "./IndicatorButton"
import { gatsbyIcon } from "../icons"
import { BuildStatus } from "../../models/enums"

const getButtonProps = ({
  buildStatus,
  buttonIndex,
}) => {
  const baseProps = {
    testId: `gatsby`,
    buttonIndex,
    iconSvg: gatsbyIcon,
  }

  const propsByBuildStatus = {
    [BuildStatus.SUCCESS]: null,
    [BuildStatus.ERROR]: null,
    [BuildStatus.BUILDING]: null,
    [BuildStatus.UPTODATE]: {
      active: true,
    },
  }
  const props = buildStatus ? propsByBuildStatus[buildStatus] : null
  if (props) {
    return { ...baseProps, ...props }
  }
  return baseProps
}

const GatsbyIndicatorButton = props => (
  <IndicatorButton {...getButtonProps(props)} />
)

export default GatsbyIndicatorButton

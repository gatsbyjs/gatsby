import React from "react"
import IndicatorButton from "./IndicatorButton"
import {
  BuildErrorTooltipContent,
  BuildSuccessTooltipContent,
} from "../tooltips"
import { gatsbyIcon } from "../icons"

const getButtonProps = ({
  buildStatus,
  orgId,
  siteId,
  buildId,
  isOnPrettyUrl,
  sitePrefix,
  erroredBuildId,
}) => {
  switch (buildStatus) {
    case `BUILDING`:
    case `ERROR`:
    case `SUCCESS`:
    case `UPTODATE`:
    default: {
      return {
        active: true,
      }
    }
  }
}

export default function GatsbyIndicatorButton(props) {
  return (
    <IndicatorButton
      testId="gatsby"
      iconSvg={gatsbyIcon}
      {...getButtonProps(props)}
      buttonIndex={props.buttonIndex}
    />
  )
}

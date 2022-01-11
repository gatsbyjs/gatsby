import React from "react"
import IndicatorButton from "./IndicatorButton"
import {
  BuildErrorTooltipContent,
  BuildSuccessTooltipContent,
} from "../tooltips"
import { gatsbyIcon } from "../icons"
import { BuildStatus } from "../../models/enums"

const getButtonProps = ({
  buildStatus,
  orgId,
  siteId,
  buildId,
  isOnPrettyUrl,
  sitePrefix,
  erroredBuildId,
  buttonIndex,
}) => {
  const baseProps = {
    testId: `gatsby`,
    buttonIndex,
    iconSvg: gatsbyIcon,
  }

  const propsByBuildStatus = {
    [BuildStatus.SUCCESS]: {
      tooltip: {
        testId: baseProps.testId,
        content: (
          <BuildSuccessTooltipContent
            isOnPrettyUrl={isOnPrettyUrl}
            sitePrefix={sitePrefix}
            buildId={buildId}
            siteId={siteId}
            orgId={orgId}
          />
        ),
        overrideShow: true,
      },
      active: true,
    },
    [BuildStatus.ERROR]: {
      tooltip: {
        testId: baseProps.testId,
        content: (
          <BuildErrorTooltipContent
            siteId={siteId}
            orgId={orgId}
            buildId={erroredBuildId}
          />
        ),
        overrideShow: true,
      },
      active: true,
    },
    [BuildStatus.BUILDING]: {
      tooltip: {
        testId: baseProps.testId,
        content: `Building a new preview`,
        overrideShow: true,
      },
      showSpinner: true,
    },
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

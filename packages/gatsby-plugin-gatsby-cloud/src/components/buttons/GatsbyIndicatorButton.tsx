import React, { FC } from "react"
import IndicatorButton from "./IndicatorButton"
import {
  BuildErrorTooltipContent,
  BuildSuccessTooltipContent,
} from "../tooltips"
import { gatsbyIcon } from "../icons"
import {
  IBaseButtonProps,
  IIndicatorButtonProps,
} from "../../models/components"
import { BuildStatus } from "../../models/enums"

interface IGatsbyIndicatorButtonProps extends IBaseButtonProps {
  isOnPrettyUrl?: boolean
  sitePrefix: string
  erroredBuildId: string
}

const getButtonProps = ({
  buildStatus,
  orgId,
  siteId,
  buildId,
  isOnPrettyUrl,
  sitePrefix,
  erroredBuildId,
  buttonIndex,
}: IGatsbyIndicatorButtonProps): IIndicatorButtonProps => {
  const baseProps: IIndicatorButtonProps = {
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

const GatsbyIndicatorButton: FC<IGatsbyIndicatorButtonProps> = props => (
  <IndicatorButton {...getButtonProps(props)} />
)

export default GatsbyIndicatorButton

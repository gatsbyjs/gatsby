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
  isOnPrettyUrl: boolean
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
        content: `Building a new preview`,
        overrideShow: true,
      },
      showSpinner: true,
    },
    [BuildStatus.UPTODATE]: {
      active: true,
    },
  }
  const props = propsByBuildStatus[buildStatus]
  if (props) {
    return { ...baseProps, ...props }
  }
  return baseProps
}

const GatsbyIndicatorButton: FC<IGatsbyIndicatorButtonProps> = props => (
  <IndicatorButton {...getButtonProps(props)} />
)

export default GatsbyIndicatorButton

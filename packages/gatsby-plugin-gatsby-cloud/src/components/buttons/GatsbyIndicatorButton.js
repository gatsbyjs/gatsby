import React from "react"
import { IndicatorButton } from "../buttons"
import { gatsbyIcon } from "../icons"
import {
  BuildErrorTooltipContent,
  BuildSuccessTooltipContent,
} from "../tooltips"

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
    case `SUCCESS`: {
      return {
        tooltipContent: (
          <BuildSuccessTooltipContent
            isOnPrettyUrl={isOnPrettyUrl}
            sitePrefix={sitePrefix}
            buildId={buildId}
            siteId={siteId}
            orgId={orgId}
          />
        ),
        overrideShowTooltip: true,
        active: true,
      }
    }
    case `ERROR`: {
      return {
        tooltipContent: (
          <BuildErrorTooltipContent
            siteId={siteId}
            orgId={orgId}
            buildId={erroredBuildId}
          />
        ),
        overrideShowTooltip: true,
        active: true,
      }
    }
    case `BUILDING`: {
      return {
        tooltipContent: `Building a new preview`,
        showSpinner: true,
        overrideShowTooltip: true,
      }
    }
    case `UPTODATE`: {
      return {
        active: true,
      }
    }
    default: {
      return {}
    }
  }
}

export function GatsbyIndicatorButton(props) {
  return (
    <IndicatorButton
      testId="gatsby"
      iconSvg={gatsbyIcon}
      {...getButtonProps(props)}
      buttonIndex={props.buttonIndex}
    />
  )
}

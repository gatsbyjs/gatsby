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
    case `SUCCESS`: {
      return {
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
      }
    }
    case `ERROR`: {
      return {
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
      }
    }
    case `BUILDING`: {
      return {
        tooltip: {
          content: `Building a new preview`,
          overrideShow: true,
        },
        showSpinner: true,
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

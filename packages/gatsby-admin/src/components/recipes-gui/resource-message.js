/** @jsx jsx */
/* eslint-disable */
import React from "react"
import { MdRefresh, MdBrightness1 } from "react-icons/md"
import { keyframes } from "@emotion/react"
import { BaseAnchor, SuccessIcon } from "gatsby-interface"
import { makeResourceId } from "./utils"
import { jsx } from "theme-ui"

const ResourceMessage = ({ state, resource }) => {
  let icon = (
    <MdBrightness1
      sx={{ height: `10px`, width: `15px`, display: `inline-block` }}
    />
  )
  let message = resource.describe

  if (state.value === `applyingPlan` && resource.isDone) {
    icon = <SuccessIcon />
  } else if (state.value === `applyingPlan`) {
    const keyframe = keyframes`
    0% {
      transform: rotate(0);
    }
    100% {
      transform: rotate(360deg);
    }
  `
    icon = (
      <MdRefresh
        sx={{
          display: `inline-block`,
          animation: `${keyframe} 1s linear infinite`,
          height: `15px`,
          width: `15px`,
          top: `3px`,
          position: `relative`,
        }}
      />
    )
    message = resource.describe
  } else if (state.value === `done`) {
    icon = <SuccessIcon height="15px" width="15px" />
    message = resource._message
  }

  return (
    <>
      {icon}
      {` `}
      <BaseAnchor
        href={`#${makeResourceId(resource)}`}
        onClick={e => {
          e.preventDefault()
          const target = document.getElementById(e.currentTarget.hash.slice(1))
          target.scrollIntoView({
            behavior: `smooth`, // smooth scroll
            block: `start`, // the upper border of the element will be aligned at the top of the visible part of the window of the scrollable area.
          })
        }}
      >
        {message}
      </BaseAnchor>
    </>
  )
}

export default ResourceMessage

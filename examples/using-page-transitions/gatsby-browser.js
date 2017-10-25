/* eslint-disable react/prop-types */
import React, { createElement } from "react"
import { Transition, TransitionGroup } from "react-transition-group"

import getTransitionStyle from "./src/utils/getTransitionStyle"

const ReplaceComponentRenderer = ({ props }) => {
  if (props.layout) {
    return undefined
  }
  const timeout = 250
  // else page
  return (
    <TransitionGroup>
      <Transition
        key={props.location.pathname}
        timeout={timeout}
        unmountOnExit={true}
      >
        {status =>
          createElement(props.pageResources.component, {
            ...props,
            ...props.pageResources.json,
            transition: {
              status,
              timeout,
              style: getTransitionStyle({ status, timeout }),
            },
          })}
      </Transition>
    </TransitionGroup>
  )
}

exports.replaceComponentRenderer = ReplaceComponentRenderer

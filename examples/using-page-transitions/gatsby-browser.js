/* eslint-disable react/prop-types */
/* globals window CustomEvent */
import React, { createElement } from "react"
import { Transition } from "react-transition-group"
import createHistory from "history/createBrowserHistory"

import getTransitionStyle from "./src/utils/getTransitionStyle"

const timeout = 250
const historyExitingEventType = `history::exiting`

const getUserConfirmation = (message, callback) => {
  const event = new CustomEvent(historyExitingEventType, { detail: { message } })
  window.dispatchEvent(event)
  setTimeout(() => {
    callback(true)
  }, timeout)
}
const history = createHistory({ getUserConfirmation })
// block must return a string to conform
history.block((location, action) => location.key)
exports.replaceHistory = () => history

class ReplaceComponentRenderer extends React.Component {
  constructor(props) {
    super(props)
    this.state = { exiting: false }
    this.listenerHandler = this.listenerHandler.bind(this)
  }

  listenerHandler(event) {
    this.setState({ exiting: true })
  }

  componentDidMount() {
    window.addEventListener(historyExitingEventType, this.listenerHandler)
  }

  componentWillUnmount() {
    window.removeEventListener(historyExitingEventType, this.listenerHandler)
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.location.key !== nextProps.location.key) {
      this.setState({ exiting: false })
    }
  }

  render() {
    const transitionProps = {
      timeout: {
        enter: 0,
        exit: timeout,
      },
      appear: true,
      in: !this.state.exiting,
      key: this.props.location.key,
    }
    return (
      <Transition {...transitionProps}>
      {
        (status) => createElement(this.props.pageResources.component, {
          ...this.props,
          ...this.props.pageResources.json,
          transition: {
            status,
            timeout,
            style: getTransitionStyle({ status, timeout }),
          },
        })
      }
      </Transition>
    )
  }
}

// eslint-disable-next-line react/display-name
exports.replaceComponentRenderer = ({ props }) => {
  if (props.layout) {
    return undefined
  }
  return createElement(ReplaceComponentRenderer, props)
}
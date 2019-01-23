import React from "react"
import ScrollBehavior from "scroll-behavior"
import PropTypes from "prop-types"
import { globalHistory as history } from "@reach/router/lib/history"

import SessionStorage from "./StateStorage"

const propTypes = {
  shouldUpdateScroll: PropTypes.func,
  children: PropTypes.element.isRequired,
  location: PropTypes.object.isRequired,
}

const childContextTypes = {
  scrollBehavior: PropTypes.object.isRequired,
}

class ScrollContext extends React.Component {
  constructor(props, context) {
    super(props, context)

    this.scrollBehavior = new ScrollBehavior({
      addTransitionHook: history.listen,
      stateStorage: new SessionStorage(),
      getCurrentLocation: () => this.props.location,
      shouldUpdateScroll: this.shouldUpdateScroll,
    })
  }

  getChildContext() {
    return {
      scrollBehavior: this,
    }
  }

  componentDidMount() {
    /**
     * scrollBehavior sets history.scrollRestoration to "manual" which means we have to take care of scrolling ourselves for pages.
     * It works great in a client side SPA as the browser can't jump to the correct content because it's not there yet.
     * Gatsby can because it's awesome (ships SSR html) so we don't want to disable scrollRestoration
     * see #7454
     */
    if (`scrollRestoration` in window.history) {
      window.history.scrollRestoration = `auto`
    }
  }

  componentDidUpdate(prevProps) {
    const { location } = this.props
    const prevLocation = prevProps.location

    if (location === prevLocation) {
      return
    }

    const prevRouterProps = {
      location: prevProps.location,
    }

    // The "scroll-behavior" package expects the "action" to be on the location
    // object so let's copy it over.

    // Temp hack while awaiting https://github.com/reach/router/issues/119
    if (window.__navigatingToLink) {
      location.action = `PUSH`
    } else {
      location.action = `POP`
    }

    this.scrollBehavior.updateScroll(prevRouterProps, { history, location })
  }

  componentWillUnmount() {
    this.scrollBehavior.stop()
  }

  getRouterProps() {
    const { location } = this.props
    return { location, history }
  }

  shouldUpdateScroll = (prevRouterProps, routerProps) => {
    const { shouldUpdateScroll } = this.props
    if (!shouldUpdateScroll) {
      return true
    }

    // Hack to allow accessing scrollBehavior._stateStorage.
    return shouldUpdateScroll.call(
      this.scrollBehavior,
      prevRouterProps,
      routerProps
    )
  }

  registerElement = (key, element, shouldUpdateScroll) => {
    this.scrollBehavior.registerElement(
      key,
      element,
      shouldUpdateScroll,
      this.getRouterProps()
    )
  }

  unregisterElement = key => {
    this.scrollBehavior.unregisterElement(key)
  }

  render() {
    return React.Children.only(this.props.children)
  }
}

ScrollContext.propTypes = propTypes
ScrollContext.childContextTypes = childContextTypes

export default ScrollContext

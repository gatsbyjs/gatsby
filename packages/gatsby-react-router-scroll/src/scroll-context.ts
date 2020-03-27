import React, { ReactChildren } from "react"
import ScrollBehavior from "scroll-behavior"
import PropTypes from "prop-types"
import { globalHistory as history } from "@reach/router/lib/history"
import { SessionStorage } from "./state-storage"

// A copy of the not-exposed interface in scroll-behavior
export interface ILocationBase {
  action: "PUSH" | string
  hash?: string
}

interface IScrollBehaviorProps {
  shouldUpdateScroll: any
  children: ReactChildren
  location: ILocationBase
}

interface IScrollBehaviorContextContext {
  scrollBehavior: ScrollContext
}

export class ScrollContext extends React.Component<IScrollBehaviorProps, {}> {
  scrollBehavior: ScrollBehavior<history, history>
  static childContextTypes = {
    scrollBehavior: PropTypes.object.isRequired,
  }

  constructor(props, context) {
    super(props, context)

    this.scrollBehavior = new ScrollBehavior({
      addTransitionHook: history.listen,
      stateStorage: new SessionStorage(),
      getCurrentLocation: (): ILocationBase => this.props.location,
      shouldUpdateScroll: this.shouldUpdateScroll,
    })
  }

  getChildContext(): IScrollBehaviorContextContext {
    return {
      scrollBehavior: this,
    }
  }

  componentDidUpdate(prevProps): void {
    const { location } = this.props
    const prevLocation = prevProps.location

    if (location === prevLocation) {
      return
    }

    const prevRouterProps = {
      location: prevProps.location,
    }

    this.scrollBehavior.updateScroll(prevRouterProps, { history, location })
  }

  componentWillUnmount(): void {
    this.scrollBehavior.stop()
  }

  getRouterProps(): { location: ILocationBase; history: history } {
    const { location } = this.props
    return { location, history }
  }

  shouldUpdateScroll = (prevRouterProps, routerProps): boolean => {
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

  registerElement = (
    key: string,
    element: Element | Text | null,
    shouldUpdateScroll: any
  ): void => {
    this.scrollBehavior.registerElement(
      key,
      element as HTMLElement,
      shouldUpdateScroll,
      this.getRouterProps()
    )
  }

  unregisterElement = (key: string): void => {
    this.scrollBehavior.unregisterElement(key)
  }

  render(): ReactChildren {
    return React.Children.only(this.props.children)
  }
}

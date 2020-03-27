import React, { ReactChildren } from "react"
import ScrollBehavior, {
  LocationBase,
  ScrollTarget,
  ShouldUpdateScroll,
} from "scroll-behavior"
import PropTypes from "prop-types"
import { globalHistory as history, History } from "@reach/router"
import { SessionStorage } from "./state-storage"

export interface IHistory {
  location?: LocationBase
  history?: History
}

interface IProps {
  shouldUpdateScroll: ShouldUpdateScroll<IHistory>
  children: ReactChildren
  location: LocationBase
}

interface IContext {
  scrollBehavior: ScrollContext
}

export class ScrollContext extends React.Component<IProps, {}> {
  scrollBehavior: ScrollBehavior<LocationBase, IHistory>
  static childContextTypes = {
    scrollBehavior: PropTypes.object.isRequired,
  }

  constructor(props, context) {
    super(props, context)

    this.scrollBehavior = new ScrollBehavior({
      addTransitionHook: history.listen,
      stateStorage: new SessionStorage(),
      getCurrentLocation: (): LocationBase => this.props.location,
      shouldUpdateScroll: this.shouldUpdateScroll,
    })
  }

  getChildContext(): IContext {
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

  getRouterProps(): IHistory {
    const { location } = this.props
    return { location, history }
  }

  shouldUpdateScroll = (
    prevRouterProps,
    routerProps
  ): boolean | ScrollTarget => {
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
    shouldUpdateScroll: ShouldUpdateScroll<IHistory>
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

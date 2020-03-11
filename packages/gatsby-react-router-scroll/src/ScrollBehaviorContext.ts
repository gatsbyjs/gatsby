import React from "react"
import ScrollBehavior, {
  LocationBase,
  ShouldUpdateScroll,
} from "scroll-behavior"
import PropTypes from "prop-types"
import { globalHistory as history, History } from "@reach/router"
import SessionStorage from "./StateStorage"

const propTypes = {
  shouldUpdateScroll: PropTypes.func,
  children: PropTypes.element.isRequired,
  location: PropTypes.object.isRequired,
}

const childContextTypes = {
  scrollBehavior: PropTypes.object.isRequired,
}

interface IProps {
  shouldUpdateScroll: ShouldUpdateScroll<ILocation>
  location: LocationBase
}

interface IChildContext {
  scrollBehavior: ScrollContext
}

interface ILocation {
  location?: LocationBase
  history?: History
}

class ScrollContext extends React.Component<IProps> {
  static propTypes: typeof propTypes
  static childContextTypes: typeof childContextTypes

  scrollBehavior: ScrollBehavior<LocationBase, ILocation>

  constructor(props: IProps, context: unknown) {
    super(props, context)

    this.scrollBehavior = new ScrollBehavior({
      addTransitionHook: history.listen,
      stateStorage: new SessionStorage(),
      getCurrentLocation: (): LocationBase => this.props.location,
      shouldUpdateScroll: this.shouldUpdateScroll,
    })
  }

  getChildContext(): IChildContext {
    return {
      scrollBehavior: this,
    }
  }

  componentDidUpdate(prevProps: IProps): void {
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

  getRouterProps(): ILocation {
    const { location } = this.props
    return { location, history }
  }

  shouldUpdateScroll: ShouldUpdateScroll<ILocation> = (
    prevRouterProps,
    routerProps
  ) => {
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
    element: HTMLElement,
    shouldUpdateScroll: ShouldUpdateScroll<ILocation>
  ): void => {
    this.scrollBehavior.registerElement(
      key,
      element,
      shouldUpdateScroll,
      this.getRouterProps()
    )
  }

  unregisterElement = (key: string): void => {
    this.scrollBehavior.unregisterElement(key)
  }

  render(): never | React.ReactNode {
    return React.Children.only(this.props.children)
  }
}

ScrollContext.propTypes = propTypes
ScrollContext.childContextTypes = childContextTypes

export default ScrollContext

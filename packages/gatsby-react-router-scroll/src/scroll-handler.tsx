import * as React from "react"
import { LocationContext } from "@reach/router"
import PropTypes from "prop-types"
import { SessionStorage } from "./session-storage"

export const ScrollContext = React.createContext<SessionStorage>(
  new SessionStorage()
)
ScrollContext.displayName = `GatsbyScrollContext`

type ShouldUpdateScrollFn = (
  prevRouterProps: LocationContext | undefined,
  routerProps: LocationContext
) => boolean
type ShouldUpdateScroll = undefined | ShouldUpdateScrollFn

export class ScrollHandler extends React.Component<
  LocationContext & { shouldUpdateScroll: ShouldUpdateScroll }
> {
  static propTypes = {
    shouldUpdateScroll: PropTypes.func,
    children: PropTypes.element.isRequired,
    location: PropTypes.object.isRequired,
  }

  _stateStorage: SessionStorage = new SessionStorage()

  // @see https://www.html5rocks.com/en/tutorials/speed/animations/
  _isTicking: boolean = false;
  _latestKnownScrollY: Number = 0;
  scrollListener = (): void => {
    this._latestKnownScrollY = window.scrollY;

    if (!this._isTicking) {
      this._isTicking = true;
      requestAnimationFrame(this._saveScroll.bind(this));
    }
  }

  _saveScroll(): void {
    const key = this.props.location.key || null;

    if (key) {
      this._state Storage.save(this.props.location, key, this._latestKnownScrollY)
    }
    this._isTicking = false;
  }

  componentDidMount(): void {
    window.addEventListener(`scroll`, this.scrollListener)
    let scrollPosition
    const { key, hash } = this.props.location

    if (key) {
      scrollPosition = this._stateStorage.read(this.props.location, key)
    }

    if (scrollPosition) {
      this.windowScroll(scrollPosition, undefined)
    } else if (hash) {
      this.scrollToHash(decodeURI(hash), undefined)
    }
  }

  componentWillUnmount(): void {
    window.removeEventListener(`scroll`, this.scrollListener)
  }

  componentDidUpdate(prevProps: LocationContext): void {
    const { hash, key } = this.props.location
    let scrollPosition

    if (key) {
      scrollPosition = this._stateStorage.read(this.props.location, key)
    }

    if (hash && scrollPosition === 0) {
      this.scrollToHash(decodeURI(hash), prevProps)
    } else {
      this.windowScroll(scrollPosition, prevProps)
    }
  }

  windowScroll = (
    position: number,
    prevProps: LocationContext | undefined
  ): void => {
    if (this.shouldUpdateScroll(prevProps, this.props)) {
      window.scrollTo(0, position)
    }
  }

  scrollToHash = (
    hash: string,
    prevProps: LocationContext | undefined
  ): void => {
    const node = document.getElementById(hash.substring(1))

    if (node && this.shouldUpdateScroll(prevProps, this.props)) {
      node.scrollIntoView()
    }
  }

  shouldUpdateScroll = (
    prevRouterProps: LocationContext | undefined,
    routerProps: LocationContext
  ): boolean => {
    const { shouldUpdateScroll } = this.props
    if (!shouldUpdateScroll) {
      return true
    }

    // Hack to allow accessing this._stateStorage.
    return shouldUpdateScroll.call(this, prevRouterProps, routerProps)
  }

  render(): React.ReactNode {
    return (
      <ScrollContext.Provider value={this._stateStorage}>
        {this.props.children}
      </ScrollContext.Provider>
    )
  }
}

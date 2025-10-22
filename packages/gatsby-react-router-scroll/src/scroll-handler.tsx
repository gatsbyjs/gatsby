import * as React from "react"
import { LocationContext } from "@gatsbyjs/reach-router"
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

export function ScrollHandler({location, children, shouldUpdateScroll}) {
  React.useEffect(() => {
    let scrollPosition;
    window.addEventListener(`scroll`, scrollListener)
    let scrollPosition
    const { key, hash } = location

    if (key) {
      scrollPosition = _stateStorage.read(location, key)
    }

    /** If a hash is present in the browser url as the component mounts (i.e. the user is navigating
     * from an external website) then scroll to the hash instead of any previously stored scroll
     * position. */
    if (hash) {
      scrollToHash(decodeURI(hash), undefined)
    } else if (scrollPosition) {
      windowScroll(scrollPosition, undefined)
    }
    
    return () => {
      window.removeEventListener(`scroll`, scrollListener)
    };
  }, []);
  React.useEffect(() => {
    const { hash, key } = location
    let scrollPosition

    if (key) {
      scrollPosition = _stateStorage.read(location, key)
    }

    /**  There are two pieces of state: the browser url and
     * history state which keeps track of scroll position
     * Native behaviour prescribes that we ought to restore scroll position
     * when a user navigates back in their browser (this is the `POP` action)
     * Currently, reach router has a bug that prevents this at https://github.com/reach/router/issues/228
     * So we _always_ stick to the url as a source of truth — if the url
     * contains a hash, we scroll to it
     */

    if (hash) {
      scrollToHash(decodeURI(hash), prevProps)
    } else {
      windowScroll(scrollPosition, prevProps)
    }
  }, [location, children, shouldUpdateScroll]);

  static propTypes = {
    shouldUpdateScroll: PropTypes.func,
    children: PropTypes.element.isRequired,
    location: PropTypes.object.isRequired,
  }

  _stateStorage: SessionStorage = new SessionStorage()

  _isTicking = false

  _latestKnownScrollY = 0

  const scrollListener = () => {
    _latestKnownScrollY = window.scrollY

    if (!_isTicking) {
      _isTicking = true
      requestAnimationFrame(_saveScroll.bind(this))
    }
  };

  function _saveScroll() {
    const key = location.key || null

    if (key) {
      _stateStorage.save(
        location,
        key,
        _latestKnownScrollY
      )
    }
    _isTicking = false
  }

  const windowScroll = (
    position: number,
    prevProps: LocationContext | undefined
  ) => {
    if (shouldUpdateScroll(prevProps, this.props)) {
      window.scrollTo(0, position)
    }
  };

  const scrollToHash = (
    hash: string,
    prevProps: LocationContext | undefined
  ) => {
    const node = document.getElementById(hash.substring(1))

    if (node && shouldUpdateScroll(prevProps, this.props)) {
      node.scrollIntoView()
    }
  };

  const shouldUpdateScroll = (
    prevRouterProps: LocationContext | undefined,
    routerProps: LocationContext
  ) => {
    const { shouldUpdateScroll } = this.props
    if (!shouldUpdateScroll) {
      return true
    }

    // Hack to allow accessing this._stateStorage.
    return shouldUpdateScroll.call(this, prevRouterProps, routerProps)
  };

  return (
<ScrollContext.Provider value={_stateStorage}>
{children}
</ScrollContext.Provider>
);
}

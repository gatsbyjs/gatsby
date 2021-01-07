import { Location } from "history"
const STATE_KEY_PREFIX = `@@scroll|`
const GATSBY_ROUTER_SCROLL_STATE = `___GATSBY_REACT_ROUTER_SCROLL`

export class SessionStorage {
  read(location: Location, key: string): number {
    const stateKey = this.getStateKey(location, key)

    try {
      const value = window.sessionStorage.getItem(stateKey)
      return value ? JSON.parse(value) : 0
    } catch (e) {
      if (process.env.NODE_ENV !== `production`) {
        console.warn(
          `[gatsby-react-router-scroll] Unable to access sessionStorage; sessionStorage is not available.`
        )
      }

      if (
        window &&
        window[GATSBY_ROUTER_SCROLL_STATE] &&
        window[GATSBY_ROUTER_SCROLL_STATE][stateKey]
      ) {
        return window[GATSBY_ROUTER_SCROLL_STATE][stateKey]
      }

      return 0
    }
  }

  save(location: Location, key: string, value: number): void {
    const stateKey = this.getStateKey(location, key)
    const storedValue = JSON.stringify(value)

    try {
      window.sessionStorage.setItem(stateKey, storedValue)
    } catch (e) {
      if (window && window[GATSBY_ROUTER_SCROLL_STATE]) {
        window[GATSBY_ROUTER_SCROLL_STATE][stateKey] = JSON.parse(storedValue)
      } else {
        window[GATSBY_ROUTER_SCROLL_STATE] = {}
        window[GATSBY_ROUTER_SCROLL_STATE][stateKey] = JSON.parse(storedValue)
      }

      if (process.env.NODE_ENV !== `production`) {
        console.warn(
          `[gatsby-react-router-scroll] Unable to save state in sessionStorage; sessionStorage is not available.`
        )
      }
    }
  }

  getStateKey(location: Location, key: string): string {
    const stateKeyBase = `${STATE_KEY_PREFIX}${location.pathname}`
    return key === null || typeof key === `undefined`
      ? stateKeyBase
      : `${stateKeyBase}|${key}`
  }
}

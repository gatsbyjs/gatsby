import { LocationBase, ScrollPosition } from "scroll-behavior"

const STATE_KEY_PREFIX = `@@scroll|`
const GATSBY_ROUTER_SCROLL_STATE = `___GATSBY_REACT_ROUTER_SCROLL`

interface ILocation extends LocationBase {
  key?: string
  pathname?: string
}

export default class SessionStorage {
  read(
    location: LocationBase,
    key: string | null
  ): ScrollPosition | null | undefined {
    const stateKey = this.getStateKey(location, key)

    try {
      const value = window.sessionStorage.getItem(stateKey)
      return JSON.parse(value || `{}`)
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

      return ({} as unknown) as undefined
    }
  }

  save(location: LocationBase, key: string | null, value: unknown): void {
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

  getStateKey(location: ILocation, key?: string | null): string {
    const locationKey = location.key || location.pathname
    const stateKeyBase = `${STATE_KEY_PREFIX}${locationKey}`
    return key === null || typeof key === `undefined`
      ? stateKeyBase
      : `${stateKeyBase}|${key}`
  }
}

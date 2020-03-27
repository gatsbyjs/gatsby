import { ILocationBase } from "./scroll-context"

const STATE_KEY_PREFIX = `@@scroll|`
const GATSBY_ROUTER_SCROLL_STATE = `___GATSBY_REACT_ROUTER_SCROLL`

type ScrollPosition = [number, number]

interface ILocation extends ILocationBase {
  key?: string
  pathname?: string
}

export class SessionStorage {
  read(
    location: ILocation,
    key: string | null
  ): ScrollPosition | null | undefined {
    const stateKey = SessionStorage.getStateKey(location, key)

    try {
      const value = window.sessionStorage.getItem(stateKey)
      if (value) {
        return JSON.parse(value) as ScrollPosition
      }
      throw ReferenceError
    } catch (e) {
      if (process.env.NODE_ENV !== `production`) {
        console.warn(
          `[gatsby-react-router-scroll] Unable to access sessionStorage; sessionStorage is not available.`
        )
      }

      if (window?.[GATSBY_ROUTER_SCROLL_STATE]?.[stateKey]) {
        return window[GATSBY_ROUTER_SCROLL_STATE][stateKey] as ScrollPosition
      }

      return null
    }
  }

  save(location: ILocation, key: string | null, value): void {
    const stateKey = SessionStorage.getStateKey(location, key)
    const storedValue = JSON.stringify(value)

    try {
      window.sessionStorage.setItem(stateKey, storedValue)
    } catch (e) {
      if (!window?.[GATSBY_ROUTER_SCROLL_STATE]) {
        window[GATSBY_ROUTER_SCROLL_STATE] = {}
      }
      window[GATSBY_ROUTER_SCROLL_STATE][stateKey] = JSON.parse(storedValue)

      if (process.env.NODE_ENV !== `production`) {
        console.warn(
          `[gatsby-react-router-scroll] Unable to save state in sessionStorage; sessionStorage is not available.`
        )
      }
    }
  }

  static getStateKey(location: ILocation, key: string | null): string {
    const locationKey = location.key || location.pathname
    const stateKeyBase = `${STATE_KEY_PREFIX}${locationKey}`
    return key === null || typeof key === `undefined`
      ? stateKeyBase
      : `${stateKeyBase}|${key}`
  }
}

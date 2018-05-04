const STATE_KEY_PREFIX = `@@scroll|`
const GATSBY_ROUTER_SCROLL_STATE = `___GATSBY_REACT_ROUTER_SCROLL`

export default class SessionStorage {
  read(location, key) {
    const stateKey = this.getStateKey(location, key)

    try {
      const value = window.sessionStorage.getItem(stateKey)
      return JSON.parse(value)
    } catch (e) {
      console.warn(
        `[gatsby-react-router-scroll] Unable to access sessionStorage; sessionStorage is not available.`
      )

      if (
        window &&
        window[GATSBY_ROUTER_SCROLL_STATE] &&
        window[GATSBY_ROUTER_SCROLL_STATE][stateKey]
      ) {
        return window[GATSBY_ROUTER_SCROLL_STATE][stateKey]
      }

      return {}
    }
  }

  save(location, key, value) {
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

      console.warn(
        `[gatsby-react-router-scroll] Unable to save state in sessionStorage; sessionStorage is not available.`
      )
    }
  }

  getStateKey(location, key) {
    const stateKeyBase = `${STATE_KEY_PREFIX}${location.pathname}`
    return key === null || typeof key === `undefined`
      ? stateKeyBase
      : `${stateKeyBase}|${key}`
  }
}

const STATE_KEY_PREFIX = `@@scroll|`

export default class SessionStorage {
  read(location, key) {
    try {
      const stateKey = this.getStateKey(location, key)
      const value = sessionStorage.getItem(stateKey)
      return JSON.parse(value)
    } catch (e) {
      console.warn('[gatsby-react-router-scroll] Unable to access sessionStorage; sessionStorage is not available.');
      return;
    }

  }

  save(location, key, value) {
    try {
      const stateKey = this.getStateKey(location, key)
      const storedValue = JSON.stringify(value)
      sessionStorage.setItem(stateKey, storedValue)
    } catch (e) {
      console.warn('[gatsby-react-router-scroll] Unable to save state in sessionStorage; sessionStorage is not available.');
      return;
    }

  }

  getStateKey(location, key) {
    try {
      const locationKey = location.key
      const stateKeyBase = `${STATE_KEY_PREFIX}${locationKey}`
      return key == null ? stateKeyBase : `${stateKeyBase}|${key}`
    } catch (e) {
      console.warn('Please enable cookies');
      return;
    }

  }
}

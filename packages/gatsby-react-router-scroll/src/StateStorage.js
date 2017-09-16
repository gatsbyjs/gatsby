const STATE_KEY_PREFIX = `@@scroll|`

export default class SessionStorage {
  read(location, key) {
    const stateKey = this.getStateKey(location, key)
    const value = sessionStorage.getItem(stateKey)
    return JSON.parse(value)
  }

  save(location, key, value) {
    const stateKey = this.getStateKey(location, key)
    const storedValue = JSON.stringify(value)
    sessionStorage.setItem(stateKey, storedValue)
  }

  getStateKey(location, key) {
    const locationKey = location.key
    const stateKeyBase = `${STATE_KEY_PREFIX}${locationKey}`
    return key == null ? stateKeyBase : `${stateKeyBase}|${key}`
  }
}

const path = require(`path`)
const Store = require(`./store`)
const fetch = require(`node-fetch`)
const Configstore = require(`configstore`)

const isTruthy = require(`./is-truthy`)

/* The events data collection is a spooled process that
 * buffers events to a local fs based buffer
 * which then is asynchronously flushed to the server.
 * This both increases the fault tolerancy and allows collection
 * to continue even when working offline.
 */
module.exports = class EventStorage {
  constructor() {
    try {
      this.config = new Configstore(`gatsby`, {}, { globalConfigPath: true })
    } catch (e) {
      // in case of some permission issues the configstore throws
      // so fallback to a simple in memory config
      // this.config = {
      //   get: key => this.config[key],
      //   set: (key, value) => (this.config[key] = value),
      //   all: this.config,
      // }
      // Log this event
    }

    const parentFolder = path.dirname(this.config.path)

    this.store = new Store(parentFolder)
    this.debugEvents = isTruthy(process.env.GATSBY_TELEMETRY_DEBUG)
    this.disabled = isTruthy(process.env.GATSBY_TELEMETRY_DISABLED)
  }

  addEvent(event) {
    if (this.disabled) {
      return
    }

    if (this.debugEvents) {
      console.error(`Captured event:`, JSON.stringify(event))
    } else {
      this.store.appendToBuffer(JSON.stringify(event) + `\n`)
    }
  }

  async sendEvents() {
    return this.store.startFlushEvents(async eventsData => {
      const events = eventsData
        .split(`\n`)
        .filter(e => e && e.length > 2) // drop empty lines
        .map(e => JSON.parse(e))

      return this.submitEvents(events)
    })
  }

  async submitEvents(events) {
    try {
      const res = await fetch(`https://analytics.gatsbyjs.com/events`, {
        method: `POST`,
        headers: { "content-type": `application/json` },
        body: JSON.stringify(events),
      })
      return res.ok
    } catch (e) {
      return false
    }
  }

  getConfig(key) {
    if (key) {
      return this.config.get(key)
    }
    return this.config.all
  }

  updateConfig(key, value) {
    return this.config.set(key, value)
  }
}

import path from "path"
import Configstore from "configstore"
import createFetch from "@turist/fetch"
import { Store } from "./store"
import { ensureDirSync } from "fs-extra"
import { isTruthy } from "./is-truthy"
import { InMemoryConfigStore } from "./in-memory-store"

const fetch = createFetch()

/* The events data collection is a spooled process that
 * buffers events to a local fs based buffer
 * which then is asynchronously flushed to the server.
 * This both increases the fault tolerance and allows collection
 * to continue even when working offline.
 */
export class EventStorage {
  analyticsApi =
    process.env.GATSBY_TELEMETRY_API || `https://analytics.gatsbyjs.com/events`
  config: Configstore | InMemoryConfigStore
  store: Store
  verbose: boolean
  debugEvents: boolean
  disabled: boolean

  constructor() {
    try {
      this.config = new Configstore(`gatsby`, {}, { globalConfigPath: true })
    } catch (e) {
      this.config = new InMemoryConfigStore()
    }

    const baseDir = path.dirname(this.config.path)

    try {
      ensureDirSync(baseDir)
    } catch (e) {
      // TODO: Log this event
    }

    this.store = new Store(baseDir)
    this.verbose = isTruthy(process.env.GATSBY_TELEMETRY_VERBOSE)
    this.debugEvents = isTruthy(process.env.GATSBY_TELEMETRY_DEBUG)
    this.disabled = isTruthy(process.env.GATSBY_TELEMETRY_DISABLED)
  }

  isTrackingDisabled(): boolean {
    return this.disabled
  }

  addEvent(event: unknown): void {
    if (this.disabled) {
      return
    }

    const eventString = JSON.stringify(event)

    if (this.debugEvents || this.verbose) {
      console.log(`Captured event:`, JSON.parse(eventString))

      if (this.debugEvents) {
        // Bail because we don't want to send debug events
        return
      }
    }

    this.store.appendToBuffer(eventString + `\n`)
  }

  async sendEvents(): Promise<boolean> {
    return this.store.startFlushEvents(async (eventsData: string) => {
      const events = eventsData
        .split(`\n`)
        .filter(e => e && e.length > 2) // drop empty lines
        .map(e => JSON.parse(e))

      return this.submitEvents(events)
    })
  }

  async submitEvents(events: unknown): Promise<boolean> {
    try {
      const res = await fetch(this.analyticsApi, {
        method: `POST`,
        headers: {
          "content-type": `application/json`,
          "user-agent": this.getUserAgent(),
        },
        body: JSON.stringify(events),
      })
      return res.ok
    } catch (e) {
      return false
    }
  }

  getUserAgent(): string {
    try {
      const { name, version } = require(`../package.json`)
      return `${name}:${version}`
    } catch (e) {
      return `Gatsby Telemetry`
    }
  }

  getConfig(key: string): string | boolean | Record<string, unknown> {
    if (key) {
      return this.config.get(key)
    }
    return this.config.all
  }

  updateConfig(key: string, value: string | number | boolean | null): void {
    return this.config.set(key, value)
  }
}

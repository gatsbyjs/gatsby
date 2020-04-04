import * as os from 'os'
import * as path from 'path'
import Store from './store'
import * as fetch from 'node-fetch'
import * as Configstore from 'configstore'
import { ensureDirSync } from 'fs-extra'

import { isTruthy } from './is-truthy'

/*
 * The events data collection is a spooled process that
 * buffers events to a local fs based buffer
 * which then is asynchronously flushed to the server.
 * This both increases the fault tolerance and allows collection
 * to continue even when working offline.
 */

const GATSBY_TELEMETRY_API: string | undefined = process.env.GATSBY_TELEMETRY_API;

import { name, version } from '../package.json'

export class EventStorage {
  config: Configstore
  store: Store
  verbose: boolean
  debugEvents: boolean
  disabled: boolean

  analyticsApi = GATSBY_TELEMETRY_API || `https://analytics.gatsbyjs.com/events`

  constructor() {
    try {
      this.config = new Configstore(`gatsby`, {}, { globalConfigPath: true })
    } catch (e) {
      const currentConfig = undefined //this.config
      // This should never happen
      this.config = {
        get: (key) => this.config[key],
        // @ts-ignore
        set: (key, value) => (this.config[key] = value),
        all: currentConfig,
        path: path.join(os.tmpdir(), `gatsby`),
        "telemetry.enabled": true,
        "telemetry.machineId": `not-a-machine-id`,
      }
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

  isTrackingDisabled() {
    return this.disabled
  }

  addEvent(event) {
    if (this.disabled) {
      return
    }

    const eventString = JSON.stringify(event)

    if (this.debugEvents || this.verbose) {
      console.error(`Captured event:`, JSON.parse(eventString))

      if (this.debugEvents) {
        // Bail because we don't want to send debug events
        return
      }
    }

    this.store.appendToBuffer(eventString + `\n`)
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
      return `${name}:${version}`
    } catch (e) {
      return `Gatsby Telemetry`
    }
  }

  getConfig(key: string | undefined): any {
    if (typeof key !== 'undefined') {
      return this.config.get(key)
    }

    return this.config.all
  }

  updateConfig(key: string, value: any): void {
    this.config.set(key, value)
  }
}

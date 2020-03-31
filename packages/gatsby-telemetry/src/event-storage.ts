import os from "os"
import path from "path"
import { Store } from "./store"
import fetch from "node-fetch"
import Configstore from "configstore"
import { ensureDirSync } from "fs-extra"

import { isTruthy } from "./is-truthy"

interface IConfigTypes {
  "telemetry.machineId": string
  "telemetry.enabled": boolean
}

/**
 * The events data collection is a spooled process that
 * buffers events to a local fs based buffer
 * which then is asynchronously flushed to the server.
 * This both increases the fault tolerancy and allows collection
 * to continue even when working offline.
 */
export class EventStorage {
  private analyticsApi =
    process.env.GATSBY_TELEMETRY_API || `https://analytics.gatsbyjs.com/events`
  private config: Configstore
  private store: Store
  private verbose: boolean
  private debugEvents: boolean
  private disabled: boolean

  constructor() {
    try {
      this.config = new Configstore(`gatsby`, {}, { globalConfigPath: true })
    } catch (e) {
      // This should never happen
      this.config = {
        get: key => this.config[key],
        set: (key: string | [string, unknown][], value?: unknown) => {
          // This function has two overloads.
          // 1. (key: string, value: unknown)
          // 2. (values: [string, unknown][])
          if (typeof key === `string`) {
            this.config[key] = value
          } else {
            for (const [k, v] of key) {
              this.config[k] = v
            }
          }
        },
        path: path.join(os.tmpdir(), `gatsby`),
      } as Configstore

      this.config.all = this.config
      this.config[`telemetry.machineId`] = `not-a-machine-id`
      this.config[`telemetry.enabled`] = true
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
      console.error(`Captured event:`, JSON.parse(eventString))

      if (this.debugEvents) {
        // Bail because we don't want to send debug events
        return
      }
    }

    this.store.appendToBuffer(eventString + `\n`)
  }

  async sendEvents(): Promise<void> {
    return this.store.startFlushEvents(async eventsData => {
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

  getConfig<TKey extends keyof IConfigTypes>(key: TKey): IConfigTypes[TKey] {
    if (key) {
      return this.config.get(key)
    }
    return this.config.all
  }

  updateConfig<TKey extends keyof IConfigTypes>(
    key: TKey,
    value: IConfigTypes[TKey] | undefined
  ): void {
    return this.config.set(key, value)
  }
}

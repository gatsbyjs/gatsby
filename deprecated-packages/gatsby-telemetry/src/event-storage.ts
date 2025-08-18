/* eslint-disable @typescript-eslint/no-unused-vars */

import path from "path"
import { Store } from "./store"
import { ensureDirSync } from "fs-extra"

import { InMemoryConfigStore } from "./in-memory-store"

/* The events data collection is a spooled process that
 * buffers events to a local fs based buffer
 * which then is asynchronously flushed to the server.
 * This both increases the fault tolerance and allows collection
 * to continue even when working offline.
 */
export class EventStorage {
  analyticsApi = process.env.GATSBY_TELEMETRY_API
  config: InMemoryConfigStore
  store: Store
  verbose: boolean
  debugEvents: boolean
  disabled: boolean

  constructor() {
    this.config = new InMemoryConfigStore()

    const baseDir = path.dirname(this.config.path)

    try {
      ensureDirSync(baseDir)
    } catch (e) {
      // TODO: Log this event
    }

    this.store = new Store(baseDir)
    this.verbose = false
    this.debugEvents = false
    this.disabled = true
  }

  isTrackingDisabled(): boolean {
    return this.disabled
  }

  addEvent(_event: unknown): void {}

  async sendEvents(): Promise<boolean> {
    return true
  }

  async submitEvents(_events: unknown): Promise<boolean> {
    return true
  }

  getUserAgent(): string {
    try {
      const { name, version } = require(`../package.json`)
      return `${name}:${version}`
    } catch (e) {
      return `Gatsby Telemetry`
    }
  }

  getConfig(key: string): string | boolean | unknown | Record<string, unknown> {
    if (key) {
      return this.config.get(key)
    }
    return this.config.all()
  }

  updateConfig(key: string, value: string | number | boolean | null): void {
    return this.config.set(key, value)
  }
}

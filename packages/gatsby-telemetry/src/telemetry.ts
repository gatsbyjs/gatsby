import uuidv4 from "uuid/v4"
import os from "os"
import {
  isCI,
  getCIName,
  createContentDigest,
  getTermProgram,
} from "gatsby-core-utils"
import {
  getRepositoryId as _getRepositoryId,
  IRepositoryId,
} from "./repository-id"
import { createFlush } from "./create-flush"
import { EventStorage } from "./event-storage"
import { showAnalyticsNotification } from "./show-analytics-notification"
import { cleanPaths } from "./error-helpers"
import { getDependencies } from "./get-dependencies"

import { join, sep } from "path"
import isDocker from "is-docker"
import lodash from "lodash"

const typedUUIDv4 = uuidv4 as () => string

const finalEventRegex = /(END|STOP)$/
const dbEngine = `redux`

export type SemVer = string

interface IOSInfo {
  nodeVersion: SemVer
  platform: string
  release: string
  cpus?: string
  arch: string
  ci?: boolean
  ciName: string | null
  docker?: boolean
  termProgram?: string
  isTTY: boolean
}

export interface IAggregateStats {
  count: number
  min: number
  max: number
  sum: number
  mean: number
  median: number
  stdDev: number
  skewness: number
}

interface IAnalyticsTrackerConstructorParameters {
  componentId?: SemVer
  gatsbyCliVersion?: SemVer
  trackingEnabled?: boolean
}

export interface IStructuredError {
  id?: string
  code?: string
  text: string
  level?: string
  type?: string
  context?: unknown
  error?: {
    stack?: string
  }
}

export interface IStructuredErrorV2 {
  id?: string
  text: string
  level?: string
  type?: string
  context?: string
  stack?: string
}

export interface ITelemetryTagsPayload {
  name?: string
  starterName?: string
  siteName?: string
  siteHash?: string
  userAgent?: string
  pluginName?: string
  exitCode?: number
  duration?: number
  uiSource?: string
  valid?: boolean
  plugins?: Array<string>
  pathname?: string
  error?: IStructuredError | Array<IStructuredError>
  cacheStatus?: string
  pluginCachePurged?: string
  dependencies?: Array<string>
  devDependencies?: Array<string>
  siteMeasurements?: {
    pagesCount?: number
    clientsCount?: number
    paths?: Array<string | undefined>
    bundleStats?: unknown
    pageDataStats?: unknown
    queryStats?: unknown
  }
  errorV2?: IStructuredErrorV2
  valueString?: string
  valueStringArray?: Array<string>
  valueInteger?: number
}

export interface IDefaultTelemetryTagsPayload extends ITelemetryTagsPayload {
  gatsbyCliVersion?: SemVer
  installedGatsbyVersion?: SemVer
}

export interface ITelemetryOptsPayload {
  debounce?: boolean
}

export class AnalyticsTracker {
  store = new EventStorage()
  componentId: string
  debouncer = {}
  metadataCache = {}
  defaultTags = {}
  osInfo?: IOSInfo // lazy
  trackingEnabled?: boolean // lazy
  componentVersion?: string
  sessionId: string = this.getSessionId()
  gatsbyCliVersion?: SemVer
  installedGatsbyVersion?: SemVer
  repositoryId?: IRepositoryId
  features = new Set<string>()
  machineId: string
  siteHash?: string = createContentDigest(process.cwd())

  constructor({
    componentId,
    gatsbyCliVersion,
    trackingEnabled,
  }: IAnalyticsTrackerConstructorParameters = {}) {
    this.componentId = componentId || `gatsby-cli`
    try {
      if (this.store.isTrackingDisabled()) {
        this.trackingEnabled = false
      }
      if (trackingEnabled !== undefined) {
        this.trackingEnabled = trackingEnabled
      }

      this.defaultTags = this.getTagsFromEnv()

      // These may throw and should be last
      this.componentVersion = require(`../package.json`).version
      this.gatsbyCliVersion = gatsbyCliVersion || this.getGatsbyCliVersion()
      this.installedGatsbyVersion = this.getGatsbyVersion()
    } catch (e) {
      // ignore
    }
    this.machineId = this.getMachineId()
    this.captureMetadataEvent()
  }

  // We might have two instances of this lib loaded, one from globally installed gatsby-cli and one from local gatsby.
  // Hence we need to use process level globals that are not scoped to this module
  getSessionId(): string {
    const p = process as any
    if (!p.gatsbyTelemetrySessionId) {
      p.gatsbyTelemetrySessionId = uuidv4()
    }
    return p.gatsbyTelemetrySessionId
  }

  getRepositoryId(): IRepositoryId {
    if (!this.repositoryId) {
      this.repositoryId = _getRepositoryId()
    }
    return this.repositoryId
  }

  getTagsFromEnv(): Record<string, unknown> {
    if (process.env.GATSBY_TELEMETRY_TAGS) {
      try {
        return JSON.parse(process.env.GATSBY_TELEMETRY_TAGS)
      } catch (_) {
        // ignore
      }
    }
    return {}
  }

  getGatsbyVersion(): SemVer {
    const packageInfo = require(join(
      process.cwd(),
      `node_modules`,
      `gatsby`,
      `package.json`
    ))
    try {
      return packageInfo.version
    } catch (e) {
      // ignore
    }
    return `-0.0.0`
  }

  getGatsbyCliVersion(): SemVer {
    try {
      const jsonfile = join(
        require
          .resolve(`gatsby-cli`) // Resolve where current gatsby-cli would be loaded from.
          .split(sep)
          .slice(0, -2) // drop lib/index.js
          .join(sep),
        `package.json`
      )
      const { version } = require(jsonfile).version
      return version
    } catch (e) {
      // ignore
    }
    return `-0.0.0`
  }

  trackCli(
    type: string | Array<string> = ``,
    tags: ITelemetryTagsPayload = {},
    opts: ITelemetryOptsPayload = { debounce: false }
  ): void {
    if (!this.isTrackingEnabled()) {
      return
    }
    if (typeof tags.siteHash === `undefined`) {
      tags.siteHash = this.siteHash
    }
    this.captureEvent(type, tags, opts)
  }

  captureEvent(
    type: string | Array<string> = ``,
    tags: ITelemetryTagsPayload = {},
    opts: ITelemetryOptsPayload = { debounce: false }
  ): void {
    if (!this.isTrackingEnabled()) {
      return
    }
    let baseEventType = `CLI_COMMAND`
    if (Array.isArray(type)) {
      type = type.length > 2 ? type[2].toUpperCase() : ``
      baseEventType = `CLI_RAW_COMMAND`
    }

    const decoration = this.metadataCache[type]
    const eventType = `${baseEventType}_${type}`

    if (opts.debounce) {
      const debounceTime = 5 * 1000
      const now = Date.now()
      const debounceKey = JSON.stringify({ type, decoration, tags })
      const last = this.debouncer[debounceKey] || 0
      if (now - last < debounceTime) {
        return
      }
      this.debouncer[debounceKey] = now
    }

    delete this.metadataCache[type]
    this.buildAndStoreEvent(eventType, lodash.merge({}, tags, decoration))
  }

  isFinalEvent(event: string): boolean {
    return finalEventRegex.test(event)
  }

  captureError(type: string, tags: ITelemetryTagsPayload = {}): void {
    if (!this.isTrackingEnabled()) {
      return
    }

    const decoration = this.metadataCache[type]
    delete this.metadataCache[type]
    const eventType = `CLI_ERROR_${type}`

    this.formatErrorAndStoreEvent(eventType, lodash.merge({}, tags, decoration))
  }

  captureBuildError(type: string, tags: ITelemetryTagsPayload = {}): void {
    if (!this.isTrackingEnabled()) {
      return
    }
    const decoration = this.metadataCache[type]
    delete this.metadataCache[type]
    const eventType = `BUILD_ERROR_${type}`

    this.formatErrorAndStoreEvent(eventType, lodash.merge({}, tags, decoration))
  }

  formatErrorAndStoreEvent(
    eventType: string,
    tags: ITelemetryTagsPayload
  ): void {
    if (tags.error) {
      // `error` ought to have been `errors` but is `error` in the database
      if (Array.isArray(tags.error)) {
        const { error, ...restOfTags } = tags
        error.forEach(err => {
          this.formatErrorAndStoreEvent(eventType, {
            error: err,
            ...restOfTags,
          })
        })
        return
      }

      tags.errorV2 = {
        // errorCode field was changed from `id` to `code`
        id: tags.error.code || tags.error.id,
        text: cleanPaths(tags.error.text),
        level: tags.error.level,
        type: tags.error?.type,
        // see if we need empty string or can just use NULL
        stack: cleanPaths(tags.error?.error?.stack || ``),
        context: cleanPaths(JSON.stringify(tags.error?.context)),
      }

      delete tags.error
    }

    this.buildAndStoreEvent(eventType, tags)
  }

  buildAndStoreEvent(eventType: string, tags: ITelemetryTagsPayload): void {
    const event = {
      installedGatsbyVersion: this.installedGatsbyVersion,
      gatsbyCliVersion: this.gatsbyCliVersion,
      ...lodash.merge({}, this.defaultTags, tags), // The schema must include these
      eventType,
      sessionId: this.sessionId,
      time: new Date(),
      machineId: this.getMachineId(),
      componentId: this.componentId,
      osInformation: this.getOsInfo(),
      componentVersion: this.componentVersion,
      dbEngine,
      features: Array.from(this.features),
      ...this.getRepositoryId(),
    }
    this.store.addEvent(event)
    if (this.isFinalEvent(eventType)) {
      // call create flush
      const flush = createFlush(this.isTrackingEnabled())
      flush()
    }
  }

  getIsTTY(): boolean {
    return Boolean(process.stdout?.isTTY)
  }

  getMachineId(): string {
    // Cache the result
    if (this.machineId) {
      return this.machineId
    }
    let machineId = this.store.getConfig(`telemetry.machineId`)
    if (typeof machineId !== `string`) {
      machineId = typedUUIDv4()
    }
    this.store.updateConfig(`telemetry.machineId`, machineId)
    this.machineId = machineId
    return machineId
  }

  isTrackingEnabled(): boolean {
    // Cache the result
    if (this.trackingEnabled !== undefined) {
      return this.trackingEnabled
    }
    let enabled = this.store.getConfig(`telemetry.enabled`) as boolean | null
    if (enabled === undefined || enabled === null) {
      if (!isCI()) {
        showAnalyticsNotification()
      }
      enabled = true
      this.store.updateConfig(`telemetry.enabled`, enabled)
    }
    this.trackingEnabled = enabled
    return enabled
  }

  getOsInfo(): IOSInfo {
    if (this.osInfo) {
      return this.osInfo
    }
    const cpus = os.cpus()
    const osInfo = {
      nodeVersion: process.version,
      platform: os.platform(),
      release: os.release(),
      cpus: (cpus && cpus.length > 0 && cpus[0].model) || undefined,
      arch: os.arch(),
      ci: isCI(),
      ciName: getCIName(),
      docker: isDocker(),
      termProgram: getTermProgram(),
      isTTY: this.getIsTTY(),
    }
    this.osInfo = osInfo
    return osInfo
  }

  trackActivity(source: string, tags: ITelemetryTagsPayload = {}): void {
    if (!this.isTrackingEnabled()) {
      return
    }
    // debounce by sending only the first event within a rolling window
    const now = Date.now()
    const last = this.debouncer[source] || 0
    const debounceTime = 5 * 1000 // 5 sec

    if (now - last > debounceTime) {
      this.captureEvent(source, tags)
    }
    this.debouncer[source] = now
  }

  decorateNextEvent(event: string, obj): void {
    const cached = this.metadataCache[event] || {}
    this.metadataCache[event] = Object.assign(cached, obj)
  }

  addSiteMeasurement(event: string, obj): void {
    const cachedEvent = this.metadataCache[event] || {}
    const cachedMeasurements = cachedEvent.siteMeasurements || {}
    this.metadataCache[event] = Object.assign(cachedEvent, {
      siteMeasurements: Object.assign(cachedMeasurements, obj),
    })
  }

  decorateAll(tags: ITelemetryTagsPayload): void {
    this.defaultTags = Object.assign(this.defaultTags, tags)
  }

  setTelemetryEnabled(enabled: boolean): void {
    this.trackingEnabled = enabled
    this.store.updateConfig(`telemetry.enabled`, enabled)
  }

  aggregateStats(data: Array<number>): IAggregateStats {
    const sum = data.reduce((acc, x) => acc + x, 0)
    const mean = sum / data.length || 0
    const median = data.sort()[Math.floor((data.length - 1) / 2)] || 0
    const stdDev =
      Math.sqrt(
        data.reduce((acc, x) => acc + Math.pow(x - mean, 2), 0) /
          (data.length - 1)
      ) || 0

    const skewness =
      data.reduce((acc, x) => acc + Math.pow(x - mean, 3), 0) /
      data.length /
      Math.pow(stdDev, 3)

    return {
      count: data.length,
      min: data.reduce((acc, x) => (x < acc ? x : acc), data[0] || 0),
      max: data.reduce((acc, x) => (x > acc ? x : acc), 0),
      sum: sum,
      mean: mean,
      median: median,
      stdDev: stdDev,
      skewness: !Number.isNaN(skewness) ? skewness : 0,
    }
  }

  captureMetadataEvent(): void {
    if (!this.isTrackingEnabled()) {
      return
    }
    const deps = getDependencies()
    const evt = {
      dependencies: deps?.dependencies,
      devDependencies: deps?.devDependencies,
    }

    this.captureEvent(`METADATA`, evt)
  }

  async sendEvents(): Promise<boolean> {
    if (!this.isTrackingEnabled()) {
      return true
    }

    return this.store.sendEvents()
  }

  trackFeatureIsUsed(name: string): void {
    this.features.add(name)
  }
}

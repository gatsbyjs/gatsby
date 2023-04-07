import * as fs from "fs-extra"
import os from "os"
import {
  isCI,
  getCIName,
  createContentDigest,
  getTermProgram,
  uuid,
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

import isDocker from "is-docker"
import lodash from "lodash"

const typedUUIDv4 = uuid.v4 as () => string

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
    totalPagesCount?: number
    createdNodesCount?: number
    touchedNodesCount?: number
    updatedNodesCount?: number
    deletedNodesCount?: number
    clientsCount?: number
    paths?: Array<string | undefined>
    bundleStats?: unknown
    pageDataStats?: unknown
    queryStats?: unknown
    SSRCount?: number
    DSGCount?: number
    SSGCount?: number
  }
  errorV2?: IStructuredErrorV2
  valueString?: string
  valueStringArray?: Array<string>
  valueInteger?: number
  valueBoolean?: boolean
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
  lastEnvTagsFromFileTime = 0
  lastEnvTagsFromFileValue: ITelemetryTagsPayload = {}

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
  // Hence we need to use process level globals that are not scoped to this module.
  // Due to the forking on develop process, we also need to pass this via process.env so that child processes have the same sessionId
  getSessionId(): string {
    const p = process as any
    if (!p.gatsbyTelemetrySessionId) {
      const inherited = process.env.INTERNAL_GATSBY_TELEMETRY_SESSION_ID
      if (inherited) {
        p.gatsbyTelemetrySessionId = inherited
      } else {
        p.gatsbyTelemetrySessionId = uuid.v4()
        process.env.INTERNAL_GATSBY_TELEMETRY_SESSION_ID =
          p.gatsbyTelemetrySessionId
      }
    } else if (!process.env.INTERNAL_GATSBY_TELEMETRY_SESSION_ID) {
      // in case older `gatsby-telemetry` already set `gatsbyTelemetrySessionId` property on process
      // but didn't set env var - let's make sure env var is set
      process.env.INTERNAL_GATSBY_TELEMETRY_SESSION_ID =
        p.gatsbyTelemetrySessionId
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
    try {
      const packageJson = require.resolve(`gatsby/package.json`)
      const { version } = JSON.parse(fs.readFileSync(packageJson, `utf-8`))
      return version
    } catch (e) {
      // ignore
    }
    return `-0.0.0`
  }

  getGatsbyCliVersion(): SemVer {
    try {
      const jsonfile = require.resolve(`gatsby-cli/package.json`)
      const { version } = JSON.parse(fs.readFileSync(jsonfile, `utf-8`))
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
      ...this.getTagsFromPath(),
    }
    this.store.addEvent(event)
    if (this.isFinalEvent(eventType)) {
      // call create flush
      const flush = createFlush(this.isTrackingEnabled())
      flush()
    }
  }

  getTagsFromPath(): ITelemetryTagsPayload {
    const path = process.env.GATSBY_TELEMETRY_METADATA_PATH

    if (!path) {
      return {}
    }
    try {
      const stat = fs.statSync(path)
      if (this.lastEnvTagsFromFileTime < stat.mtimeMs) {
        this.lastEnvTagsFromFileTime = stat.mtimeMs
        const data = fs.readFileSync(path, `utf8`)
        this.lastEnvTagsFromFileValue = JSON.parse(data)
      }
    } catch (e) {
      // nop
      return {}
    }
    return this.lastEnvTagsFromFileValue
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
      this.store.updateConfig(`telemetry.machineId`, machineId)
    }
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

  addSiteMeasurement(
    event: string,
    obj: ITelemetryTagsPayload["siteMeasurements"]
  ): void {
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

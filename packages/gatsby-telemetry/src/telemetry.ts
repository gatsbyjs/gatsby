/* eslint-disable @typescript-eslint/no-unused-vars */

import * as fs from "fs-extra"
import os from "os"
import { createContentDigest, getTermProgram, uuid } from "gatsby-core-utils"
import {
  getRepositoryId as _getRepositoryId,
  IRepositoryId,
} from "./repository-id"

const finalEventRegex = /(END|STOP)$/

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

  siteHash?: string = createContentDigest(process.cwd())
  lastEnvTagsFromFileTime = 0
  lastEnvTagsFromFileValue: ITelemetryTagsPayload = {}

  constructor(_arg: IAnalyticsTrackerConstructorParameters = {}) {
    // no-op
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
    _type: string | Array<string> = ``,
    _tags: ITelemetryTagsPayload = {},
    _opts: ITelemetryOptsPayload = { debounce: false }
  ): void {}

  captureEvent(
    _type: string | Array<string> = ``,
    _tags: ITelemetryTagsPayload = {},
    _opts: ITelemetryOptsPayload = { debounce: false }
  ): void {}

  isFinalEvent(event: string): boolean {
    return finalEventRegex.test(event)
  }

  captureError(_type: string, _tags: ITelemetryTagsPayload = {}): void {}

  captureBuildError(_type: string, _tags: ITelemetryTagsPayload = {}): void {}

  formatErrorAndStoreEvent(
    _eventType: string,
    _tags: ITelemetryTagsPayload
  ): void {}

  buildAndStoreEvent(_eventType: string, _tags: ITelemetryTagsPayload): void {}

  getTagsFromPath(): ITelemetryTagsPayload {
    return {}
  }

  getIsTTY(): boolean {
    return Boolean(process.stdout?.isTTY)
  }

  getMachineId(): string {
    return ``
  }

  isTrackingEnabled(): boolean {
    return false
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
      ci: false,
      ciName: null,
      docker: false,
      termProgram: getTermProgram(),
      isTTY: this.getIsTTY(),
    }
    this.osInfo = osInfo
    return osInfo
  }

  trackActivity(_source: string, _tags: ITelemetryTagsPayload = {}): void {}

  decorateNextEvent(_event: string, _obj): void {}

  addSiteMeasurement(
    _event: string,
    _obj: ITelemetryTagsPayload["siteMeasurements"]
  ): void {}

  decorateAll(_tags: ITelemetryTagsPayload): void {}

  setTelemetryEnabled(_enabled: boolean): void {}

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

  captureMetadataEvent(): void {}

  async sendEvents(): Promise<boolean> {
    return true
  }

  trackFeatureIsUsed(_name: string): void {}
}

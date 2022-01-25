import * as fs from "fs"

export type OOMWatcherOptions = {
  pollInterval?: number
}

const defaultOptions = {
  pollInterval: .01 * 1000,
}

export class OOMWatcher {
  private timeout?: number
  private pollInterval: number

  constructor(options?: OOMWatcherOptions) {
    const merged = {
      ...defaultOptions,
      ...options,
    }
    this.pollInterval = merged.pollInterval
  }

  private async getLimit() {
    const limitBuffer = await fs.promises.readFile(
      `/sys/fs/cgroup/memory/memory.limit_in_bytes`
    )
    const limit = parseInt(limitBuffer.toString(`utf-8`), 10)
    return limit
  }

  private async getRSS() {
    const memoryStatBuffer = await fs.promises.readFile(
      `/sys/fs/cgroup/memory/memory.stat`
    )
    const memoryStat = memoryStatBuffer.toString(`utf-8`)
    const stats = Object.fromEntries(
      memoryStat
        .split(`\n`)
        .filter(Boolean)
        .map(line => {
          const [key, value] = line.split(/\s+/)
          return [key, parseInt(value, 10)]
        })
    )
    return stats[`rss`]
  }

  public stop() {
    this.timeout && clearInterval(this.timeout)
  }

  public start(
    callback: ({
      rss,
      limit,
      ratio,
    }: {
      rss: number
      limit: number
      ratio: number
    }) => void
  ) {
    // TODO clean up that/this references
    const pollInterval = this.pollInterval
    const process = async (that: OOMWatcher) => {
      const limit = await that.getLimit()
      const rss = await that.getRSS()
      const ratio = rss / limit

      await callback({ rss, limit, ratio })
      that.timeout = setTimeout(process, pollInterval, that)
    }

    process(this);
  }
}

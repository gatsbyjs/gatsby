const { performance } = require(`perf_hooks`)

const { sync: glob } = require(`fast-glob`)
const nodeFetch = require(`node-fetch`)
const uuidv4 = require(`uuid/v4`)
const { execSync } = require(`child_process`)
const fs = require(`fs`)

const bootstrapTime = performance.now()

const BENCHMARK_REPORTING_URL =
  process.env.BENCHMARK_REPORTING_URL === `cli`
    ? undefined
    : process.env.BENCHMARK_REPORTING_URL

// Track the last received `api` because not all events in this plugin will receive one
let lastApi
function reportInfo(...args) {
  ;(lastApi ? lastApi.reporter : console).info(...args)
}
function reportError(...args) {
  ;(lastApi ? lastApi.reporter : console).error(...args)
}

class BenchMeta {
  constructor() {
    this.flushing = undefined // Promise of flushing if that has started
    this.flushed = false // Completed flushing?
    this.localTime = new Date().toISOString()
    this.timestamps = {
      // TODO: we should also have access to node's timing data and see how long it took before bootstrapping this script
      bootstrapTime, // Start of this file
      instantiationTime: performance.now(), // Instantiation time of this class
      benchmarkStart: 0, // Start of benchmark itself
      preInit: 0, // Gatsby onPreInit life cycle
      preBootstrap: 0, // Gatsby onPreBootstrap life cycle
      preBuild: 0, // Gatsby onPreBuild life cycle
      postBuild: 0, // Gatsby onPostBuild life cycle
      benchmarkEnd: 0, // End of benchmark itself
    }
    this.started = false
  }

  getData() {
    // Get memory usage snapshot first (just in case)
    const memory = process.memoryUsage()

    for (const key in this.timestamps) {
      this.timestamps[key] = Math.floor(this.timestamps[key])
    }

    // For the time being, our target benchmarks are part of the main repo
    // And we will want to know what version of the repo we're testing with
    const gitHash = execSync(`git rev-parse HEAD`, { encoding: `utf8` }).trim()

    const nodeVersion = execSync(`node --version`, {
      encoding: `utf8`,
    }).trim()

    const gatsbyCliVersion = execSync(`gatsby --version`, {
      encoding: `utf8`,
    }).trim()

    const gatsbyVersion = require(`gatsby/package.json`).version

    const sharpVersion = fs.existsSync(`node_modules/sharp/package.json`)
      ? require(`sharp/package.json`).version
      : `none`

    const webpackVersion = execSync(`node_modules/.bin/webpack --version`, {
      encoding: `utf8`,
    }).trim()

    const publicJsSize = execSync(
      `echo "0 $(find public -maxdepth 1 -iname "*.js" -printf " + %s")" | bc`,
      { encoding: `utf8` }
    ).trim()

    const jpgCount = execSync(
      `find public .cache  -type f -iname "*.jpg" -or -iname "*.jpeg" | wc -l`,
      { encoding: `utf8` }
    ).trim()

    const pngCount = execSync(
      `find public .cache  -type f -iname "*.png" | wc -l`,
      { encoding: `utf8` }
    ).trim()

    const gifCount = execSync(
      `find public .cache  -type f -iname "*.gif" | wc -l`,
      { encoding: `utf8` }
    ).trim()

    const rndCount = execSync(
      `find public .cache  -type f -iname "*.bmp" -or -iname "*.tif" -or -iname "*.webp" -or -iname "*.svg" | wc -l`,
      { encoding: `utf8` }
    ).trim()

    const pageCount = glob(`**/**.json`, {
      cwd: `./public/page-data`,
      nocase: true,
    }).length

    return {
      time: this.localTime,
      sessionId: process.gatsbyTelemetrySessionId || uuidv4(),
      timestamps: this.timestamps,
      gitHash,
      ci: process.env.CI || false,
      ciName: process.env.CI_NAME || `local`,
      telemetryTags: process.env.GATSBY_TELEMETRY_TAGS,
      nodeVersion,
      gatsbyVersion,
      gatsbyCliVersion,
      sharpVersion,
      webpackVersion,
      memory,
      publicJsSize,
      pageCount,
      jpgCount,
      pngCount,
      gifCount,
      rndCount,
    }
  }

  markStart() {
    if (this.started) {
      reportError(
        `gatsby-plugin-benchmark-reporting: `,
        new Error(`Error: Should not call markStart() more than once`)
      )
      process.exit(1)
    }
    this.timestamps.benchmarkStart = performance.now()
    this.started = true
  }

  markDataPoint(name) {
    if (BENCHMARK_REPORTING_URL) {
      if (!(name in this.timestamps)) {
        reportError(
          `Attempted to record a timestamp with a name (\`${name}\`) that wasn't expected`
        )
        process.exit(1)
      }
    }
    this.timestamps[name] = performance.now()
  }

  async markEnd() {
    if (!this.timestamps.benchmarkStart) {
      reportError(
        `gatsby-plugin-benchmark-reporting:`,
        new Error(`Error: Should not call markEnd() before calling markStart()`)
      )
      process.exit(1)
    }
    this.timestamps.benchmarkEnd = performance.now()
    return this.flush()
  }

  async flush() {
    const data = this.getData()
    const json = JSON.stringify(data, null, 2)

    if (!BENCHMARK_REPORTING_URL) {
      reportInfo(`Gathered data: ` + json)
      reportInfo(`BENCHMARK_REPORTING_URL not set, not submitting data`)

      this.flushed = true
      return (this.flushing = Promise.resolve())
    }

    reportInfo(`Gathered data: ` + json)
    reportInfo(`Flushing benchmark data to remote server...`)

    let lastStatus = 0
    this.flushing = nodeFetch(`${BENCHMARK_REPORTING_URL}`, {
      method: `POST`,
      headers: {
        "content-type": `application/json`,
        // "user-agent": this.getUserAgent(),
      },
      body: json,
    }).then(res => {
      lastStatus = res.status
      if (lastStatus === 500) {
        reportError(
          `Response error`,
          new Error(`Server responded with a 500 error`)
        )
        process.exit(1)
      }
      this.flushed = true
      // Note: res.text returns a promise
      return res.text()
    })

    this.flushing.then(text =>
      reportInfo(`Server response: ${lastStatus}: ${text}`)
    )

    return this.flushing
  }
}

process.on(`exit`, () => {
  if (!benchMeta.flushed) {
    // This is probably already a non-zero exit as otherwise node should wait for the last promise to complete
    reportError(
      `gatsby-plugin-benchmark-reporting error`,
      new Error(
        `This is process.exit(); Benchmark plugin has not completely flushed yet`
      )
    )
    process.exit(1)
  }
})

const benchMeta = new BenchMeta()

async function onPreInit(api) {
  lastApi = api
  // This should be set in the gatsby-config of the site when enabling this plugin
  reportInfo(
    `gatsby-plugin-benchmark-reporting: Will post benchmark data to: ${BENCHMARK_REPORTING_URL ||
      `the CLI`}`
  )

  benchMeta.markStart()
  benchMeta.markDataPoint(`preInit`)
}

async function onPreBootstrap(api) {
  lastApi = api
  benchMeta.markDataPoint(`preBootstrap`)
}

async function onPreBuild(api) {
  lastApi = api
  benchMeta.markDataPoint(`preBuild`)
}

async function onPostBuild(api) {
  lastApi = api
  benchMeta.markDataPoint(`postBuild`)
  return benchMeta.markEnd()
}

module.exports = { onPreInit, onPreBootstrap, onPreBuild, onPostBuild }

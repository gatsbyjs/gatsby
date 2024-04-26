import { performance } from "node:perf_hooks";

import { sync as glob } from "fast-glob";
import { uuid } from "gatsby-core-utils";
import { execSync } from "node:child_process";
import fs from "node:fs";

const bootstrapTime = performance.now();

const CI_NAME = process.env.CI_NAME;

const BENCHMARK_REPORTING_URL =
  process.env.BENCHMARK_REPORTING_URL === "cli"
    ? undefined
    : process.env.BENCHMARK_REPORTING_URL;

// Track the last received `api` because not all events in this plugin will receive one
let lastApi;
// Current benchmark state, if any. If none then create one on next lifecycle.
let benchMeta;

let nextBuildType = process.env.BENCHMARK_BUILD_TYPE ?? "initial";

function reportInfo(...args): void {
  (lastApi ? lastApi.reporter : console).info(...args);
}
function reportError(...args): void {
  (lastApi ? lastApi.reporter : console).error(...args);
}

function execToStr(cmd: string): string {
  return String(
    execSync(cmd, {
      encoding: "utf8",
    }) ?? "",
  ).trim();
}
function execToInt(cmd: string): number {
  // `parseInt` can return `NaN` for unexpected args
  // `Number` can return undefined for unexpected args
  // `0 | x` (bitwise or) will always return 0 for unexpected args, or 32bit int
  // @ts-ignore The left-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type.ts(2362)
  return execToStr(cmd) | 0;
}

class BenchMeta {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  flushing: Promise<any> | undefined;
  flushed: boolean;
  localTime: string;
  timestamps: {
    bootstrapTime: number;
    instantiationTime: number;
    benchmarkStart: number;
    preInit: number;
    preBootstrap: number;
    preBuild: number;
    postBuild: number;
    benchmarkEnd: number;
  };
  started: boolean;
  constructor() {
    this.flushing = undefined; // Promise of flushing if that has started
    this.flushed = false; // Completed flushing?
    this.localTime = new Date().toISOString();
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
    };
    this.started = false;
  }

  getMetadata(): {
    buildId?: string | undefined;
    branch?: string | undefined;
    siteId: string;
    contentSource?: string | undefined;
    siteType?: string | undefined;
    repoName?: string | undefined;
    buildType: string;
  } {
    let siteId = "";
    try {
      // The tags ought to be a json string, but we try/catch it just in case it's not, or not a valid json string
      siteId =
        JSON.parse(process.env?.GATSBY_TELEMETRY_TAGS ?? "{}")?.siteId ?? ""; // Set by server
    } catch (e) {
      siteId = "error";
      reportInfo(
        `Suppressed an error trying to JSON.parse(GATSBY_TELEMETRY_TAGS): ${e}`,
      );
    }

    /**
     * If we are running in netlify, environment variables can be attached using the INCOMING_HOOK_BODY
     * extract the configuration from there
     */

    let buildType = nextBuildType;
    nextBuildType = process.env.BENCHMARK_BUILD_TYPE_NEXT ?? "DATA_UPDATE";
    const incomingHookBodyEnv = process.env.INCOMING_HOOK_BODY;

    if (CI_NAME === "netlify" && incomingHookBodyEnv) {
      try {
        const incomingHookBody = JSON.parse(incomingHookBodyEnv);
        buildType = incomingHookBody && incomingHookBody.buildType;
      } catch (e) {
        reportInfo(
          `Suppressed an error trying to JSON.parse(INCOMING_HOOK_BODY): ${e}`,
        );
      }
    }

    return {
      buildId: process.env.BENCHMARK_BUILD_ID,
      branch: process.env.BENCHMARK_BRANCH,
      siteId,
      contentSource: process.env.BENCHMARK_CONTENT_SOURCE,
      siteType: process.env.BENCHMARK_SITE_TYPE,
      repoName: process.env.BENCHMARK_REPO_NAME,
      buildType: buildType,
    };
  }

  getData(): {
    buildId?: string | undefined;
    branch?: string | undefined;
    siteId: string;
    contentSource?: string | undefined;
    siteType?: string | undefined;
    repoName?: string | undefined;
    buildType: string;
    time: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sessionId: any;
    cwd: string;
    timestamps: {
      bootstrapTime: number;
      instantiationTime: number;
      benchmarkStart: number;
      preInit: number;
      preBootstrap: number;
      preBuild: number;
      postBuild: number;
      benchmarkEnd: number;
    };
    gitHash: string;
    commitTime: string;
    ci: string | boolean;
    ciName: string;
    versions: {
      nodejs: string;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      gatsby: any;
      gatsbyCli: string;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      sharp: any;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      webpack: any;
    };
    counts: {
      pages: number;
      jpgs: number;
      pngs: number;
      gifs: number;
      other: number;
    };
    memory: {
      rss: number;
      heapTotal: number;
      heapUsed: number;
      external: number;
    };
    publicJsSize: number;
  } {
    // Get memory usage snapshot first (just in case)
    const { rss, heapTotal, heapUsed, external } = process.memoryUsage();
    const memory = {
      rss: rss ?? 0,
      heapTotal: heapTotal ?? 0,
      heapUsed: heapUsed ?? 0,
      external: external ?? 0,
    };

    // eslint-disable-next-line guard-for-in
    for (const key in this.timestamps) {
      this.timestamps[key] = Math.floor(this.timestamps[key]);
    }

    // For the time being, our target benchmarks are part of the main repo
    // And we will want to know what version of the repo we're testing with
    // This won't work as intended when running a site not in our repo (!)
    const gitHash = execToStr("git rev-parse HEAD");
    // Git only supports UTC tz through env var, but the unix time stamp is UTC
    const unixStamp = execToStr('git show --quiet --date=unix --format="%cd"');
    const commitTime = new Date(parseInt(unixStamp, 10) * 1000).toISOString();

    const nodejsVersion = process.version;

    // This assumes the benchmark is started explicitly from `node_modules/.bin/gatsby`, and not a global install
    // (This is what `gatsby --version` does too, ultimately)
    const gatsbyCliVersion = execToStr("node_modules/.bin/gatsby --version");

    const gatsbyVersion = require("gatsby/package.json").version;

    const sharpVersion = fs.existsSync("node_modules/sharp/package.json")
      ? require("sharp/package.json").version
      : "none";

    const webpackVersion = require("webpack/package.json").version;

    const publicJsSize = glob("public/*.js").reduce(
      (t, file) => t + fs.statSync(file).size,
      0,
    );

    const jpgCount = execToInt(
      'find public .cache  -type f -iname "*.jpg" -or -iname "*.jpeg" | wc -l',
    );

    const pngCount = execToInt(
      'find public .cache  -type f -iname "*.png" | wc -l',
    );

    const gifCount = execToInt(
      'find public .cache  -type f -iname "*.gif" | wc -l',
    );

    const otherCount = execToInt(
      'find public .cache  -type f -iname "*.bmp" -or -iname "*.tif" -or -iname "*.webp" -or -iname "*.svg" | wc -l',
    );

    const benchmarkMetadata = this.getMetadata();

    return {
      time: this.localTime,
      // @ts-ignore Property 'gatsbyTelemetrySessionId' does not exist on type 'Process'.ts(2339)
      sessionId: process.gatsbyTelemetrySessionId ?? uuid.v4(),
      cwd: process.cwd() ?? "",
      timestamps: this.timestamps,
      gitHash,
      commitTime,
      ci: process.env.CI || false,
      ciName: CI_NAME || "local",
      versions: {
        nodejs: nodejsVersion,
        gatsby: gatsbyVersion,
        gatsbyCli: gatsbyCliVersion,
        sharp: sharpVersion,
        webpack: webpackVersion,
      },
      counts: {
        pages: parseInt(process.env.NUM_PAGES ?? "1"),
        jpgs: jpgCount,
        pngs: pngCount,
        gifs: gifCount,
        other: otherCount,
      },
      memory,
      publicJsSize,
      ...benchmarkMetadata,
    };
  }

  markStart(): void {
    if (this.started) {
      reportError(
        "gatsby-plugin-benchmark-reporting: ",
        new Error("Error: Should not call markStart() more than once"),
      );
      process.exit(1);
    }
    this.timestamps.benchmarkStart = performance.now();
    this.started = true;
  }

  markDataPoint(name: string): void {
    if (BENCHMARK_REPORTING_URL) {
      if (!(name in this.timestamps)) {
        reportError(
          `Attempted to record a timestamp with a name (\`${name}\`) that wasn't expected`,
        );
        process.exit(1);
      }
    }
    this.timestamps[name] = performance.now();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async markEnd(): Promise<any> {
    if (!this.timestamps.benchmarkStart) {
      reportError(
        "gatsby-plugin-benchmark-reporting:",
        new Error(
          "Error: Should not call markEnd() before calling markStart()",
        ),
      );
      process.exit(1);
    }
    this.timestamps.benchmarkEnd = performance.now();
    return this.flush();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async flush(): Promise<any> {
    const data = this.getData();
    const json = JSON.stringify(data, null, 2);

    if (!BENCHMARK_REPORTING_URL) {
      reportInfo("Gathered data: " + json);
      reportInfo("BENCHMARK_REPORTING_URL not set, not submitting data");

      this.flushed = true;
      return (this.flushing = Promise.resolve());
    }

    reportInfo("Gathered data: " + json);
    reportInfo("Flushing benchmark data to remote server...");

    let lastStatus = 0;
    this.flushing = globalThis
      .fetch(`${BENCHMARK_REPORTING_URL}`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-benchmark-secret": process.env.BENCHMARK_REPORTING_SECRET ?? "",
        },
        body: json,
      })
      .then((res) => {
        lastStatus = res.status;
        if ([401, 500].includes(lastStatus)) {
          reportInfo(`Got ${lastStatus} response, waiting for text`);
          res.text().then((content) => {
            reportError(
              "Response error",
              new Error(
                `Server responded with a ${lastStatus} error: ${content}`,
              ),
            );
            process.exit(1);
          });
        }
        this.flushed = true;
        // Note: res.text returns a promise
        return res.text();
      });

    this.flushing.then((text) =>
      reportInfo(`Server response: ${lastStatus}: ${text}`),
    );

    return this.flushing;
  }
}

function init(stage: string): void {
  console.info(`gatsby-plugin-benchmark-reporting: Initializing ${stage}`);

  if (!benchMeta) {
    benchMeta = new BenchMeta();
    // This should be set in the gatsby-config of the site when enabling this plugin
    reportInfo(
      `gatsby-plugin-benchmark-reporting: Will post benchmark data to: ${
        BENCHMARK_REPORTING_URL || "the CLI"
      }`,
    );

    benchMeta.markStart();
  }
}

process.on("exit", () => {
  if (benchMeta && !benchMeta.flushed && BENCHMARK_REPORTING_URL) {
    // This is probably already a non-zero exit as otherwise node should wait for the last promise to complete
    reportError(
      "gatsby-plugin-benchmark-reporting error",
      new Error(
        "This is process.exit(); Benchmark plugin has not completely flushed yet",
      ),
    );
    process.exit(1);
  }
});

async function onPreInit(api): Promise<void> {
  lastApi = api;
  init("preInit");
  benchMeta.markDataPoint("preInit");
}

async function onPreBootstrap(api): Promise<void> {
  lastApi = api;
  init("preBootstrap");
  benchMeta.markDataPoint("preBootstrap");
}

async function onPreBuild(api): Promise<void> {
  lastApi = api;
  init("preBuild");
  benchMeta.markDataPoint("preBuild");
}

async function onPostBuild(api): Promise<void> {
  if (!benchMeta) {
    // Ignore. Don't start measuring on this event.
    return;
  }

  lastApi = api;

  benchMeta.markDataPoint("postBuild");
  await benchMeta.markEnd();

  benchMeta = undefined;
}

module.exports = { onPreInit, onPreBootstrap, onPreBuild, onPostBuild };

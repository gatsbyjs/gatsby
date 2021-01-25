import fs from "fs-extra"
const path = require(`path`)
const _ = require(`lodash`)
const { performance } = require("perf_hooks")
const runnerPath = path.join(
  process.cwd(),
  `../../packages/dagsby/dist/index.js`
)
const dagsby = require(runnerPath)
// const top = require("process-top")()
const Inspector = require("inspector-api")
const inspector = new Inspector({ storage: { type: `fs` } })

// setInterval(function () {
// // Prints out a string containing stats about your Node.js process.
// console.log(top.toString())
// }, 1000)

// Setup worker pool
import os from "os"
// const uuid = require("uuid")
const execa = require("execa")

// const id = uuid.v4()
const id = `create-pages-benchmark`
const directory = path.join(os.tmpdir(), id)
fs.ensureDirSync(directory)
const httpPort = 9899
const socketPort = 8899
// const httpPort = 10001
// const socketPort = 10000
const numWorkers = 15
const numPages = 80000
const workerPool = execa.node(
  path.join(process.cwd(), `../../packages/dagsby/dist/worker-pool-server.js`),
  [
    `--numWorkers`,
    numWorkers,
    `--directory`,
    directory,
    `--socketPort`,
    socketPort,
    `--httpPort`,
    httpPort,
  ]
)

workerPool.stdout.pipe(process.stdout)
workerPool.stderr.pipe(process.stderr)
;(async () => {
  const runner = await dagsby.createRunner({
    pools: [{ socketPort, httpPort }],
  })
  async function ssrPage(
    { pagePath, publicDir = `/a/directory/to/somewhere` },
    { files, cache }
  ) {
    const fs = require(`fs-extra`)
    const path = require(`path`)

    const rendererPath = path.join(__dirname, `render-page.js`)
    if (!fs.existsSync(rendererPath)) {
      fs.copyFileSync(files.renderPage.localPath, rendererPath)
    }

    const checkForHtmlSuffix = (pagePath: string): boolean =>
      !/\.(html?)$/i.test(pagePath)

    // copied from https://github.com/markdalgleish/static-site-generator-webpack-plugin/blob/master/index.js#L161
    const getPageHtmlFilePath = (dir: string, outputPath: string): string => {
      let outputFileName = outputPath.replace(/^(\/|\\)/, ``) // Remove leading slashes for webpack-dev-server

      if (checkForHtmlSuffix(outputPath)) {
        outputFileName = path.join(outputFileName, `index.html`)
      }

      return path.join(dir, outputFileName)
    }

    const renderer = require(rendererPath)

    const htmlStr = await new Promise(resolve =>
      renderer.default(
        {
          pagePath: pagePath,
          pageData: {
            result: { data: { body: `` } },
            componentChunkName: `component---src-templates-blank-js`,
          },
        },
        (err, str) => {
          // console.log(str)
          resolve(str)
        }
      )
    )

    // const fsWriteResult = await fs.writeFile(
    const writeResult = await cache.set(
      getPageHtmlFilePath(publicDir, pagePath),
      htmlStr
    )
    // )

    return writeResult
  }

  const runQuery = async (args, { files, cache }) => {
    // const fetch = require(`node-fetch`)
    var unified = require("unified")
    var markdown = require("remark-parse")
    var html = require("remark-html")

    const result = {}

    result.mdStr = await cache.get(`${args.id}.md`)

    // Transform markdown string to html.
    const bodyStr = await new Promise(resolve =>
      unified()
        .use(markdown)
        .use(html)
        .process(result.mdStr, function (err, html) {
          resolve(String(html))
        })
    )
    result.html = bodyStr

    // console.log(files)
    // Render page.
    // const renderer = require(files.renderPage.localPath)

    // const htmlStr = await new Promise(resolve =>
    // renderer.default(
    // {
    // pagePath: `/blog/1`,
    // pageData: {
    // result: { data: { body: bodyStr } },
    // componentChunkName: `component---src-templates-basic-blog-js`,
    // },
    // },
    // (err, str) => {
    // // console.log(str)
    // resolve(str)
    // }
    // )
    // )

    await cache.set(`${args.id}.html`, result.html)

    // result.htmlStr = htmlStr
    // return result
    return `ok`
  }

  const queryTask = await dagsby.createTask({
    func: runQuery,
    returnOnlyErrors: true,
    argsSchema: [
      {
        name: `id`,
        type: `int`,
      },
    ],
    // files: {
    // renderPage: {
    // originPath: path.join(process.cwd(), `public`, `render-page.js`),
    // },
    // },
    dependencies: {
      "remark-html": `latest`,
      "remark-parse": `latest`,
      unified: `latest`,
      lodash: `latest`,
      "fs-extra": "latest",
      semver: `latest`,
    },
  })

  const task = await dagsby.createTask({
    func: ssrPage,
    returnOnlyErrors: true,
    argsSchema: [
      {
        name: `pagePath`,
        type: `string`,
      },
    ],
    files: {
      renderPage: {
        originPath: path.join(process.cwd(), `public`, `render-page.js`),
      },
    },
    dependencies: {
      react: `latest`, // Get from project eventually
      "react-dom": `latest`,
      "remark-html": `latest`,
      "remark-parse": `latest`,
      unified: `latest`,
      "node-fetch": `latest`,
      "@reach/router": `latest`,
      "common-tags": `latest`,
      debug: `latest`,
      lodash: `latest`,
      "fs-extra": "latest",
      semver: `latest`,
    },
  })

  await runner.setupTask(queryTask)

  const start = performance.now()
  ;(async () => {
    await inspector.profiler.enable()
    await inspector.profiler.start()
    console.log({ numPages })
    const results = await Promise.all(
      _.range(numPages).map(page =>
        // runner.executeTask({ task, args: { pagePath: `/page/${page}/` } })
        runner.executeTask({ task: queryTask, args: { id: page } })
      )
    )

    console.log(`done`)

    const output = await inspector.profiler.stop()
    const totalTime = performance.now() - start
    // console.log(results)
    console.log(`total time: ${totalTime}`)
    console.log(`average time`, totalTime / numWorkers / numPages)
    console.log(`pages / second`, 1000 / (totalTime / numPages))
  })()
})()

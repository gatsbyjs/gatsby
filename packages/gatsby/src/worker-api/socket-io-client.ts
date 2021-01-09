// Gatsby's scheduler

// const IP = `159.65.103.164`
const IP = `143.110.158.220`

const fs = require(`fs-extra`)
const crypto = require(`crypto`)
const path = require(`path`)
const _ = require(`lodash`)
var socket = require("socket.io-client")(`http://${IP}:3000`)
const { default: PQueue } = require("p-queue")
const uuid = require(`uuid`)
const fetch = require(`node-fetch`)
const http = require(`http`)
const JestWorker = require(`jest-worker`).default
const { performance } = require("perf_hooks")

// const chunkSize = 100
// const worker = new JestWorker(require.resolve("./upload-worker"), {
// numWorkers: 4,
// })

// Create queue and pause immediately and resume once the server is ready
const queue = new PQueue({ concurrency: 120 })
// queue.pause()

const mtimes = new Map()
const hashes = new Map()
const inFlight = new Map()
async function md5File(filePath) {
  if (inFlight.has(filePath)) {
    return inFlight.get(filePath)
  } else {
    const md5Promise = new Promise((resolve, reject) => {
      const newMtime = fs.statSync(filePath).mtime.getTime()
      let renew = false
      // Has the file changed?
      if (mtimes.has(filePath)) {
        if (newMtime !== mtimes.get(filePath)) {
          renew = true
        }
      } else {
        renew = true
      }

      mtimes.set(filePath, newMtime)

      // If we need to renew, calculate, cache and return.
      if (renew) {
        const output = crypto.createHash("md5")
        const input = fs.createReadStream(filePath)

        input.on("error", err => {
          reject(err)
        })

        output.once("readable", () => {
          const newHash = output.read().toString("hex")
          hashes.set(filePath, newHash)
          resolve(newHash)
        })

        input.pipe(output)
      } else {
        resolve(hashes.get(path))
      }
    })

    inFlight.set(filePath, md5Promise)
    return md5Promise
  }
}

const runTask = async task => {
  let outsideResolve
  taskPromise = new Promise(resolve => {
    outsideResolve = resolve
  })
  // preprocess and then add to the queue
  // TODO only send hash of the handler function.
  const taskFn = () => {
    return new Promise(async resolve => {
      task.traceId = uuid.v4()

      if (_.isFunction(task.handler)) {
        task.handler = task.handler.toString()
      }

      if (task.files && !_.isEmpty(task.files)) {
        await Promise.all(
          _.toPairs(task.files).map(async ([name, file]) => {
            const hash = await md5File(file.originPath)
            // Discard the file path
            task.files[name] = { ...file, hash }
          })
        )
      }
      // console.time(`runTask ${task.traceId}`)
      socket.emit(`runTask`, task)
      socket.once(`response-${task.traceId}`, res => {
        // console.log(res.result.)
        // console.timeEnd(`runTask ${task.traceId}`)
        outsideResolve(res)
        resolve()
      })
    })
  }

  queue.add(taskFn)

  return taskPromise
}

let count = 0
let startTime
queue.on("active", () => {
  count += 1
  if (count % 25 === 0 || queue.pending === 0) {
    console.log(
      `Working on item #${count}.  Size: ${queue.size}  Pending: ${queue.pending}`
    )

    const now = Date.now()
    const diffTime = now - startTime
    console.log(
      `elapsed time: ${diffTime / 1000}s — ${
        count / (diffTime / 1000)
      } tasks / second`
    )
  }
})

exports.runTask = runTask

runTask({
  handler: args => {
    const path = require(`path`)
    const newPath = path.join(`blah`, `nlur`, `suoo`)
    return { newPath, theWolrldIsGreen: true }
  },
  args: { name: `World` },
}).then(result => console.log(result))

// runTask({
// handler: args => `hello ${args.name}`,
// args: { name: `Tech Council` },
// }).then(result => console.log(result))

// const filePath = path.resolve(`./data.json`)
// const filePath2 = path.resolve(`./data2.json`)
// _.range(1).forEach(i => {
// runTask({
// handler: async (args, { files }) => {
// const path = require(`path`)
// const fs = require(`fs-extra`)

// const jsonData = JSON.parse(files.data.fileBlob)
// jsonData.super = jsonData.super += 10
// const newPath = path.join(`blue`, `moon`)
// return {
// "Math!": args.a + args.b * Math.random(),
// path: newPath,
// jsonData,
// }
// },
// args: { a: 10, b: i + 2 },
// files: {
// data: {
// originPath: Math.random() > 0.5 ? filePath : filePath2,
// },
// },
// }).then(result => console.log(result))
// })

// HELLO PEOPLE
// const anotherHandler = args => {
// return `hello ${args.name}!`
// }

// runTask({
// handler: anotherHandler,
// args: { name: `Dustin` },
// }).then(result => {
// console.log(`the result`, result)
// })

const runQuery = async (args, { files }) => {
  const fetch = require(`node-fetch`)
  var unified = require("unified")
  var markdown = require("remark-parse")
  var html = require("remark-html")
  const http = require(`http`)
  const httpAgent = new http.Agent({
    keepAlive: true,
  })

  async function fetchGraphQL(operationsDoc, operationName, variables) {
    const result = await fetch("http://206.189.215.152:8080/v1/graphql", {
      method: "POST",
      body: JSON.stringify({
        query: operationsDoc,
        variables: variables,
        operationName: operationName,
      }),
      agent: function (_parsedURL) {
        if (_parsedURL.protocol == "http:") {
          return httpAgent
        } else {
          return httpsAgent
        }
      },
    })

    // console.log(`done`, variables.id)
    return await result.json()
  }

  const operationsDoc = `
  # Consider giving this mutation a unique, descriptive
  # name in your application as a best practice
  query MyQuery($id: bigint!) {
    blog_by_pk(id: $id) {
      body
      created_at
      id
      title
      updated_at
    }
  }
`

  function executeUnnamedMutation1(id) {
    return fetchGraphQL(operationsDoc, "MyQuery", {
      id,
    })
  }

  const result = await executeUnnamedMutation1(args.id)

  // Transform markdown string to html.
  const bodyStr = await new Promise(resolve =>
    unified()
      .use(markdown)
      .use(html)
      .process(result.data.blog_by_pk.body, function (err, html) {
        resolve(String(html))
      })
  )
  result.html = bodyStr

  // Render page.
  const renderer = require(files.renderPage.localPath)

  const htmlStr = await new Promise(resolve =>
    renderer.default(
      {
        pagePath: `/blog/1`,
        pageData: {
          result: { data: { body: bodyStr } },
          componentChunkName: `component---src-templates-basic-blog-js`,
        },
      },
      (err, str) => {
        // console.log(str)
        resolve(str)
      }
    )
  )

  // Imports the Google Cloud client library
  const { Storage } = require("@google-cloud/storage")

  // Creates a client
  const storage = new Storage({ keyFilename: files.key.localPath })

  console.time(`write to bucket ${args.id}`)
  const writeToBucket = await storage
    .bucket(`run-task-experiment-website`)
    .file(`${args.id}.html`)
    .save(Buffer.from(htmlStr))
  console.timeEnd(`write to bucket ${args.id}`)

  // result.htmlStr = htmlStr
  // return result
  return `ok`
}

const startQueries = performance.now()
const numQueries = 100
Promise.all(
  _.range(numQueries).map(id =>
    runTask({
      handler: runQuery,
      args: { id: id + 1 },
      files: {
        renderPage: {
          originPath: `/tmp/the-simplest-blog/public/render-page.js`,
        },
        key: {
          originPath: `./key.json`,
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
        semver: `latest`,
        "@google-cloud/storage": `latest`,
      },
    }).then(result => {
      console.log(id + 1, result.executionTime, JSON.stringify(result, null, 4))
    })
  )
).then(() => {
  const end = performance.now()
  const elapsed = end - startQueries
  console.log(
    `run queries:`,
    elapsed + `ms — ${(numQueries / elapsed) * 1000} qps`
  )
})

// const renderHtml = async (args, { files }) => {
// const requireFromString = require("require-from-string")
// const renderer = requireFromString(String(files.renderPage.fileBlob))
// console.log(args, files, renderer)

// // const renderer = require(`./render-page`)

// const htmlStr = await new Promise(resolve =>
// renderer.default(
// {
// pagePath: `/blog/1`,
// pageData: {
// result: { data: { truth: `ho` } },
// componentChunkName: `component---src-templates-basic-blog-js`,
// },
// },
// (err, str) => {
// // console.log(str)
// resolve(str)
// }
// )
// )

// return htmlStr
// }

// Real SSR
// runTask({
// handler: renderHtml,
// files: {
// renderPage: { originPath: `/tmp/the-simplest-blog/public/render-page.js` },
// },
// }).then(result => console.log(JSON.stringify(result, null, 4)))

// Pretend SSR
const rootSite = `/Users/kylemathews/programs/gatsby/benchmarks/markdown_id`
// const glob = require(`glob`)
// const files = glob.sync(`${rootSite}/public/page-data/**/page-data.json`)
// console.log(files)
// const httpAgent = new http.Agent({
// keepAlive: true,
// })
// console.log({ httpAgent })
// files.forEach(pageDataFilePath => {
// const url = `http://${IP}:3001`
// const postTask = async () => {
// // await worker.upload(url, pageDataFilePathChunk)
// const stream = fs.createReadStream(pageDataFilePath)
// return fetch(url, { method: "POST", body: stream, agent: () => httpAgent })
// }

// queue.add(postTask)
// // return runTask({
// // handler: async (args, { files }) => {
// // const fs = require(`fs-extra`)
// // const _ = require(`lodash`)

// // const paths = _.toPairs(files).map(([name, file]) => {
// // return { name, localPath: file.localPath }
// // })

// // return Promise.all(
// // paths.map(async path => {
// // const stat = await fs.stat(path.localPath)
// // return { ...path, size: stat.size }
// // })
// // )
// // },
// // files: {
// // "webpack.stats.json": {
// // originPath: path.join(rootSite, `public`, `webpack.stats.json`),
// // },
// // "chunk-map.json": {
// // originPath: path.join(rootSite, `public`, `chunk-map.json`),
// // },
// // app: {
// // originPath: path.join(
// // rootSite,
// // `public`,
// // `app-189612a2bb33ba0959bf.js`
// // ),
// // },
// // "styles.css": {
// // originPath: path.join(
// // rootSite,
// // `public`,
// // `styles.5f81339daa9828444137.css`
// // ),
// // },
// // pageData: {
// // originPath: pageDataFilePath,
// // },
// // },
// // })
// })

// Dependencies
runTask({
  handler: args => {
    const _ = require(`lodash`)
    const faker = require(`faker`)
    // return _.range(args.truth)
    return faker.name.findName()
  },
  args: { truth: 22 },
  dependencies: {
    lodash: `latest`,
    faker: `latest`,
  },
}).then(result => console.log(result))

socket.on(`connect`, async function () {
  socket.emit(`setTaskRunner`, fs.readFileSync(`./remote-task-runner.js`))
  socket.on(`serverReady`, () => {
    queue.start()
    startTime = Date.now()
    console.log(`serverReady`)

    socket.on(`response`, res => {
      // console.log(res)
    })
  })

  socket.on(`sendFile`, async file => {
    // console.log(`sendFile`, file)
    const fileContents = await fs.readFile(file.originPath)
    socket.emit(file.hash, fileContents)
  })
})

socket.on("disconnect", function () {})

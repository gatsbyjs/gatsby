import { getSiteDir, getService, createServiceLock } from "gatsby-core-utils"
import express from "express"
import bodyParser from "body-parser"
import http from "http"
import hyperdrive from "hyperdrive"
import path from "path"
import net from "net"

let drive

export const getDrive = async () => {
  // console.log(`==========`)
  // console.log(`getDrive`, drive)
  await drive?.promises.ready()
  return drive
}

// TODO Call this from regular Gatsby package.
export const startCacheServer = async (
  programPath = `/Users/kylemathews/programs/blog`
) => {
  const expressPort = 12020
  const hyperdrivePort = 12021

  // Start hyperdrive
  const pathToDB = path.join(getSiteDir(programPath), `site-db`)
  console.time(`start hyperdrive`)
  drive = hyperdrive(pathToDB)
  console.timeEnd(`start hyperdrive`)
  const hyperdriveServer = net.createServer(function (socket) {
    socket
      .pipe(
        drive.replicate({
          live: true, // keep replicating,
          encrypt: true, // Enable NOISE encryption.
        })
      )
      .pipe(socket)
  })
  hyperdriveServer.listen(hyperdrivePort)

  await drive.promises.ready()
  const key = drive.key.toString(`hex`)

  await createServiceLock(programPath, `local-cache-server`, {
    expressPort,
    hyperdrivePort,
    key,
  })

  // Create Express server
  const app = express()
  app.use(bodyParser.json())

  app.post(`/jobs`, async (req, res) => {
    let result
    const job = req.body
    if (job.name === `DOWNLOAD_IMAGE`) {
      console.log(job)
      return res.send(`ok`)
    } else {
      const worker = require(path.posix.join(
        job.plugin.resolve,
        `gatsby-worker.js`
      ))
      if (!worker[job.name]) {
        throw new Error(`No worker function found for ${job.name}`)
      }
      const workerFn = worker[job.name]

      result = await workerFn({
        inputPaths: job.inputPaths,
        outputDir: job.outputDir,
        relativeToPublicPath: job.relativeToPublicPath,
        args: job.args,
      })
    }

    drive.writeFile(
      path.join(`/job-results/`, req.body.id.toString()),
      JSON.stringify({ job: req.body, result, finished: true })
    )
    res.status(200).send(`ok`)
  })

  // Start Express.
  const server = new http.Server(app)
  server.listen(expressPort, `localhost`)

  // Create a fake job result to emulate this.
  // setInterval(() => {
  // const jobResult = { id: Math.random(), hi: `people` }
  // drive.writeFile(
  // path.join(`/job-results/`, jobResult.id.toString()),
  // JSON.stringify(jobResult)
  // )
  // }, 2000)

  return
}

// randomly pick URLs to send over & once result comes back, send another
// until they're all downloaded.
const urls = [
  `https://unsplash.com/photos/ObOpJxjNNiQ/download`,
  `https://unsplash.com/photos/9B_g1pomddw/download`,
  `https://unsplash.com/photos/musOb4yMhck/download`,
]

const enqueueCreateRemoteFileNodeJob = async url => {
  console.log(`inside`)
  const fetch = require(`node-fetch`)
  const programPath = `/Users/kylemathews/programs/blog`
  const localCacheServer = await getService(programPath, `local-cache-server`)
  fetch(`http://localhost:${localCacheServer?.expressPort}/jobs`, {
    method: `post`,
    body: JSON.stringify({
      name: `DOWNLOAD_IMAGE`,
      url,
    }),
    headers: { "Content-Type": `application/json` },
  })

  // await waitForJobToFinish(job.id)
}

setTimeout(() => enqueueCreateRemoteFileNodeJob(urls[0]), 1000)

startCacheServer()

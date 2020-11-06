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
    const job = req.body
    const worker = require(path.posix.join(
      job.plugin.resolve,
      `gatsby-worker.js`
    ))
    if (!worker[job.name]) {
      throw new Error(`No worker function found for ${job.name}`)
    }
    const workerFn = worker[job.name]

    const result = await workerFn({
      inputPaths: job.inputPaths,
      outputDir: job.outputDir,
      relativeToPublicPath: job.relativeToPublicPath,
      args: job.args,
    })

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

// startCacheServer()

import { getService } from "gatsby-core-utils"
import fetch from "node-fetch"
const path = require(`path`)

const { getDrive } = require(`./cache-server`)

// TODO
// maybe have /jobs/queued & /jobs/finished folders
// move from queued to finished
// that way we're resiliant to crashes.
const waitForJobToFinish = async jobId => {
  const drive = await getDrive()
  const jobResultPath = path.join(`/job-results/`, jobId.toString())
  await new Promise(resolve => {
    const watcher = drive.watch(jobResultPath, async () => {
      const file = JSON.parse(
        await drive.promises.readFile(jobResultPath, `utf-8`)
      )
      watcher.destroy()
      resolve()
    })
  })

  return
}

export const enqueueLocalJob = async (job): Promise<void> => {
  const localCacheServer = await getService(
    job.programPath,
    `local-cache-server`
  )
  console.log(`enquing job on cache server`, job.id)
  console.time(`process job ${job.id}`)
  fetch(`http://localhost:${localCacheServer.expressPort}/jobs`, {
    method: `post`,
    body: JSON.stringify(job),
    headers: { "Content-Type": `application/json` },
  })

  await waitForJobToFinish(job.id)
  console.timeEnd(`process job ${job.id}`)
}

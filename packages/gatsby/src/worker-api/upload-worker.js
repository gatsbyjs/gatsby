const fs = require(`fs-extra`)
const fetch = require(`node-fetch`)
const http = require(`http`)
const { default: PQueue } = require("p-queue")

const httpAgent = new http.Agent({
  keepAlive: true,
})

const queue = new PQueue({ concurrency: 350 })
exports.upload = async (url, pageDataFilePathChunk) => {
  pageDataFilePathChunk.forEach(pageDataFilePath =>
    queue.add(() => {
      const stream = fs.createReadStream(pageDataFilePath)

      return fetch(url, {
        method: "POST",
        body: stream,
        agent: () => httpAgent,
      })
    })
  )
}

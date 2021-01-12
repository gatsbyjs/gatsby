// const { Storage } = require("@google-cloud/storage")
const redis = require("redis")
const client = redis.createClient()
const fs = require(`fs-extra`)
const { promisify } = require("util")
const getAsync = promisify(client.get).bind(client)
const setAsync = promisify(client.set).bind(client)

// const storage = new Storage({ keyFilename: `./key.json` })

process.on(`message`, async file => {
  // const writeToBucket = await storage
  // .bucket(`run-task-experiment-website`)
  // .file(`${Math.random()}${file.replace(`/`, ``)}`)
  // .save(fs.readFileSync(file, `utf-8`))

  const fileStr = fs.readFileSync(file, `utf-8`)
  await setAsync(file, fileStr)

  process.send(file)
})

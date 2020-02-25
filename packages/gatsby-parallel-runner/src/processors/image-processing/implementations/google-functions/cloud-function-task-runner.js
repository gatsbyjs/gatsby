const fs = require(`fs-extra`)
const sizeof = require(`object-sizeof`)
const klaw = require(`klaw`)
const { PubSub } = require(`@google-cloud/pubsub`)
const { Storage } = require(`@google-cloud/storage`)

const MAX_PUBSUB_RESPONSE_SIZE = 1024 * 1024 // 5mb

const pubSubClient = new PubSub()
const storageClient = new Storage()

async function processPubSubMessageOrStorageObject(msg) {
  let data = null

  if (msg.bucket && msg.name) {
    const bucket = storageClient.bucket(msg.bucket)
    const file = bucket.file(msg.name)
    await file.download({ destination: `/tmp/${msg.name}` })
    data = (await fs.readFile(`/tmp/${msg.name}`)).toString()
  } else {
    data = msg.data
  }

  return JSON.parse(Buffer.from(data, `base64`).toString())
}

exports.runTask = async (msg, handler) => {
  await fs.mkdirp(`/tmp/output`)
  process.chdir(`/tmp/output`)

  const event = await processPubSubMessageOrStorageObject(msg)
  console.log(`Processing`, event.id)
  try {
    const file = Buffer.from(event.file, `base64`)
    const output = await handler(file, event)
    const result = { type: `JOB_COMPLETED` }
    const payload = { id: event.id, files: {}, output }
    for await (const file of klaw(`/tmp/output`)) {
      if (file.stats.isFile()) {
        const data = await fs.readFile(file.path)
        payload.files[
          file.path.replace(/^\/tmp\/output\//, ``)
        ] = data.toString(`base64`)
      }
    }

    const size = sizeof(payload)
    if (size > MAX_PUBSUB_RESPONSE_SIZE) {
      await storageClient
        .bucket(`event-results-${event.topic}`)
        .file(`result-${event.id}`)
        .save(Buffer.from(JSON.stringify(payload)), { resumable: false })
      result.storedPayload = `result-${event.id}`
    } else {
      result.payload = payload
    }

    const resultMsg = Buffer.from(JSON.stringify(result))
    const messageId = await pubSubClient.topic(event.topic).publish(resultMsg)
    console.log(
      `Published message `,
      event.id,
      messageId,
      resultMsg.length,
      result.storedPayload
    )
    await fs.emptyDir(`/tmp`)
  } catch (err) {
    console.error(`Failed to process message:`, event.id, err)
    await pubSubClient.topic(event.topic).publish(
      Buffer.from(
        JSON.stringify({
          type: `JOB_FAILED`,
          payload: {
            id: event.id,
            error: err.toString(),
          },
        })
      )
    )
    await fs.emptyDir(`/tmp`)
  }
}

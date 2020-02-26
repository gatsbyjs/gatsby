#!/usr/bin/env node

const { spawn } = require(`child_process`)
const { readFile, pathExists } = require(`fs-extra`)
const path = require(`path`)
const { PubSub } = require(`@google-cloud/pubsub`)
const { Storage } = require(`@google-cloud/storage`)
const { topicFor, bucketFor } = require(`./utils`)
const { resolveProcessors } = require(`../../../utils`)

function functionName(processor, type) {
  return `processor-${processor.name}-${type}`
    .toLocaleLowerCase()
    .replace(/[^a-z0-9-]/g, `-`)
    .replace(/-+/, `-`)
}

function deployType(type, processor, cwd, config) {
  return new Promise((resolve, reject) => {
    const args = [
      `functions`,
      `deploy`,
      functionName(processor, type),
      `--entry-point`,
      `processor`,
      `--memory`,
      `1024MB`,
      `--service-account`,
      config.client_email,
      `--project`,
      config.project_id,
      `--runtime`,
      `nodejs10`,
    ]
    if (type === `PubSub`) {
      args.push(`--trigger-topic`)
      args.push(topicFor(processor))
    } else {
      args.push(`--trigger-resource`)
      args.push(bucketFor(processor))
      args.push(`--trigger-event google.storage.object.finalize`)
    }

    const ps = spawn(`gcloud`, args, { shell: true, cwd, stdio: `inherit` })

    ps.on(`close`, code => {
      if (code === 0) {
        return resolve(code)
      }
      return reject(code)
    })
  })
}

exports.deploy = async function() {
  const creds = await readFile(process.env.GOOGLE_APPLICATION_CREDENTIALS)
  const config = JSON.parse(creds)

  const pubSubClient = new PubSub({
    projectId: config.project_id,
  })
  const storage = new Storage({
    projectId: config.project_id,
  })

  const processors = await resolveProcessors()
  try {
    await Promise.all(
      processors.map(async processor => {
        const cwd = path.join(
          processor.path,
          `implementations`,
          `google-functions`
        )
        const exists = await pathExists(cwd)
        if (!exists) {
          console.warn(`No google-functions implementation for`, processor.path)
          return null
        }

        try {
          await pubSubClient.createTopic(topicFor(processor))
        } catch (err) {
          console.log(`Create topic failed`, err)
        }

        try {
          const lifeCycle = `<?xml version="1.0" ?>
      <LifecycleConfiguration>
          <Rule>
              <Action>
                  <Delete/>
              </Action>
              <Condition>
                  <Age>30</Age>
              </Condition>
          </Rule>
      </LifecycleConfiguration>`
          const [bucket] = await storage.createBucket(bucketFor(processor))
          await bucket.setMetadata({ lifeCycle })
        } catch (err) {
          console.log(`Create bucket failed`, err)
        }

        try {
          console.log(`Deploying as pubsub handler`)
          await deployType(`PubSub`, processor, cwd, config)

          console.log(`Deploying as storage handler`)
          await deployType(`Storage`, processor, cwd, config)
        } catch (err) {
          console.log(`Error: `, err)
          return Promise.reject(err)
        }
        return null
      })
    )
  } catch (err) {
    return Promise.reject(err)
  }
  return null
}

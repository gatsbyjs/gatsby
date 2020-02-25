const fs = require(`fs-extra`)
const log = require(`loglevel`)

const DEFAULT_MAX_JOB_TIME = process.env.PARALLEL_RUNNER_TIMEOUT
  ? parseInt(process.env.PARALLEL_RUNNER_TIMEOUT, 10)
  : 5 * 60 * 1000

const MESSAGE_TYPES = {
  JOB_COMPLETED: `JOB_COMPLETED`,
  JOB_FAILED: `JOB_FAILED`,
}

class Job {
  constructor({ id, args, file }) {
    this.id = id
    this.args = args
    this.file = file

    return (async () => {
      try {
        await this._calculateSize()
      } catch (err) {
        return Promise.reject(err)
      }
      return this
    })()
  }

  async msg() {
    const data = await this._readData()
    return Buffer.from(
      JSON.stringify({
        id: this.id,
        file: data.toString(`base64`),
        action: this.args,
        topic: process.env.TOPIC,
      })
    )
  }

  async _calculateSize() {
    if (this.file instanceof Buffer) {
      return (this.fileSize = this.file.byteLength)
    }
    try {
      const stat = await fs.stat(this.file)
      return (this.fileSize = stat.size)
    } catch (err) {
      return Promise.reject(err)
    }
  }

  async _readData() {
    if (this.file instanceof Buffer) {
      return this.file
    }
    return await fs.readFile(this.file)
  }
}

class Queue {
  constructor({ maxJobTime, pubSubImplementation }) {
    this._jobs = new Map()
    this.maxJobTime = maxJobTime || DEFAULT_MAX_JOB_TIME
    this.pubSubImplementation = pubSubImplementation
    if (pubSubImplementation) {
      pubSubImplementation.subscribe(this._onMessage.bind(this))
    }
  }

  async push(id, msg) {
    return new Promise(async (resolve, reject) => {
      this._jobs.set(id, { resolve, reject })
      setTimeout(() => {
        if (this._jobs.has(id)) {
          reject(`Job timed out ${id}`)
        }
      }, this.maxJobTime)
      try {
        await this.pubSubImplementation.publish(id, msg)
      } catch (err) {
        reject(err)
      }
    })
  }

  _onMessage(pubSubMessage) {
    const { type, payload } = pubSubMessage
    log.debug(`Got worker message`, type, payload && payload.id)

    switch (type) {
      case MESSAGE_TYPES.JOB_COMPLETED:
        if (this._jobs.has(payload.id)) {
          this._jobs.get(payload.id).resolve(payload)
          this._jobs.delete(payload.id)
        }
        return
      case MESSAGE_TYPES.JOB_FAILED:
        if (this._jobs.has(payload.id)) {
          this._jobs.get(payload.id).reject(payload.error)
          this._jobs.delete(payload.id)
        }
        return
      default:
        log.error(`Unkown worker message: `, pubSubMessage)
    }
  }
}

exports.Job = Job
exports.Queue = Queue

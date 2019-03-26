const { homedir } = require(`os`)
const path = require(`path`)
const {
  appendFileSync,
  readFileSync,
  renameSync,
  existsSync,
  unlinkSync,
} = require(`fs`)
const { ensureDirSync } = require(`fs-extra`)
const Configstore = require(`configstore`)

module.exports = class Store {
  config = new Configstore(`gatsby`, {}, { globalConfigPath: true })

  constructor() {}

  getConfig(key) {
    if (key) {
      return this.config.get(key)
    }
    return this.config.all
  }

  updateConfig(...fields) {
    this.config.set(...fields)
  }

  appendToBuffer(event) {
    const bufferPath = this.getBufferFilePath()
    try {
      appendFileSync(bufferPath, event, `utf8`)
    } catch (e) {
      //ignore
    }
  }

  getConfigPath() {
    const configPath = path.join(homedir(), `.config/gatsby`)
    try {
      ensureDirSync(configPath)
    } catch (e) {
      //ignore
    }
    return configPath
  }

  getBufferFilePath() {
    const configPath = this.getConfigPath()
    return path.join(configPath, `events.json`)
  }

  async startFlushEvents(flushOperation) {
    const now = Date.now()
    const filePath = this.getBufferFilePath()
    try {
      if (!existsSync(filePath)) {
        return
      }
    } catch (e) {
      // ignore
      return
    }
    const newPath = `${filePath}-${now}`

    try {
      renameSync(filePath, newPath)
    } catch (e) {
      // ignore
      return
    }
    let contents
    try {
      contents = readFileSync(newPath, `utf8`)
      unlinkSync(newPath)
    } catch (e) {
      //ignore
      return
    }

    // There is still a chance process dies while sending data and some events are lost
    // This will be ok for now, however
    let success = false
    try {
      success = await flushOperation(contents)
    } catch (e) {
      // ignore
    } finally {
      // if sending fails, we write the data back to the log
      if (!success) {
        this.appendToBuffer(contents)
      }
    }
  }
}

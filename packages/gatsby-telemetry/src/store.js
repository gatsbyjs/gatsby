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
    appendFileSync(bufferPath, event, `utf8`)
  }

  getConfigPath() {
    const configPath = path.join(homedir(), `.config/gatsby`)
    ensureDirSync(configPath)
    return configPath
  }

  getBufferFilePath() {
    const configPath = this.getConfigPath()
    return path.join(configPath, `events.json`)
  }

  async startFlushEvents(flushOperation) {
    const now = Date.now()
    const filePath = this.getBufferFilePath()
    if (!existsSync(filePath)) {
      return
    }
    const newPath = `${filePath}-${now}`

    try {
      renameSync(filePath, newPath)
    } catch (e) {
      // ignore
      return
    }
    const contents = readFileSync(newPath, `utf8`)

    // There is still a chance process dies while sending data and some events are lost
    // This will be ok for now, however
    unlinkSync(newPath)
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

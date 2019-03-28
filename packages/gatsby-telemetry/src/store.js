const path = require(`path`)
const {
  appendFileSync,
  readFileSync,
  renameSync,
  existsSync,
  unlinkSync,
} = require(`fs`)
const { ensureDirSync } = require(`fs-extra`)

module.exports = class Store {
  constructor(parentFolder) {
    this.parentFolder = parentFolder
    this.bufferFilePath = path.join(this.parentFolder, `events.json`)
  }

  appendToBuffer(event) {
    try {
      appendFileSync(this.bufferFilePath, event, `utf8`)
    } catch (e) {
      //ignore
    }
  }

  async startFlushEvents(flushOperation) {
    const now = Date.now()
    try {
      if (!existsSync(this.bufferFilePath)) {
        return
      }
    } catch (e) {
      // ignore
      return
    }
    const newPath = `${this.bufferFilePath}-${now}`

    try {
      renameSync(this.bufferFilePath, newPath)
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

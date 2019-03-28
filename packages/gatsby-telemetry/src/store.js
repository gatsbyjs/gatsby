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
  }

  appendToBuffer(event) {
    const bufferPath = this.getBufferFilePath()
    console.log(bufferPath)
    try {
      appendFileSync(bufferPath, event, `utf8`)
    } catch (e) {
      //ignore
    }
  }

  getBufferFilePath() {
    // TODO: Don't run this for every event
    try {
      ensureDirSync(this.parentFolder)
    } catch (e) {
      //ignore
    }
    return path.join(this.parentFolder, `events.json`)
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

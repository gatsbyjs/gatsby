import * as path from 'path'
import {
  appendFileSync,
  readFileSync,
  renameSync,
  existsSync,
  unlinkSync,
} from 'fs'

export default class Store {
  bufferFilePath: string

  constructor(baseDir: string) {
    this.bufferFilePath = path.join(baseDir, `events.json`)
  }

  appendToBuffer(event) {
    try {
      appendFileSync(this.bufferFilePath, event, `utf8`)
    } catch (e) {
      //ignore
    }
  }

  async startFlushEvents(flushOperation: (contents: string) => Promise<boolean>): Promise<void> {
    // Unique temporary file name across multiple concurrent Gatsby instances
    const now: string = `${Date.now()}-${process.pid}`

    let success: boolean = false

    let contents: string = ''

    try {
      if (!existsSync(this.bufferFilePath)) {
        return
      }

      const newPath = `${this.bufferFilePath}-${now}`

      renameSync(this.bufferFilePath, newPath)

      contents = readFileSync(newPath, `utf8`)

      unlinkSync(newPath)

      // There is still a chance process dies while sending data and some events are lost
      // This will be ok for now, however
      success = await flushOperation(contents)
    } catch (e) {
      // ignore
      // TODO: Log this event
    } finally {
      // if sending fails, we write the data back to the log
      if (!success) {
        this.appendToBuffer(contents)
      }
    }
  }
}

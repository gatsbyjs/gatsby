import path from "path"
import {
  appendFileSync,
  readFileSync,
  renameSync,
  readdirSync,
  existsSync,
  unlinkSync,
} from "fs"

export class Store {
  bufferFilePath: string
  baseDir: string
  eventsJsonFileName = `events.json`

  constructor(baseDir: string) {
    this.bufferFilePath = path.join(baseDir, this.eventsJsonFileName)
    this.baseDir = baseDir
  }

  appendToBuffer(event: unknown): void {
    try {
      appendFileSync(this.bufferFilePath, event, `utf8`)
    } catch (e) {
      //ignore
    }
  }

  async flushFile(
    filePath: string,
    flushOperation: (contents: string) => Promise<boolean>
  ): Promise<boolean> {
    const now = `${Date.now()}-${process.pid}`
    let success = false
    let contents = ``
    try {
      if (!existsSync(filePath)) {
        return true
      }
      // Unique temporary file name across multiple concurrent Gatsby instances
      const newPath = `${this.bufferFilePath}-${now}`
      renameSync(filePath, newPath)
      contents = readFileSync(newPath, `utf8`)
      unlinkSync(newPath)

      // There is still a chance process dies while sending data and some events are lost
      // This will be ok for now, however
      success = await flushOperation(contents)
    } catch (e) {
      // ignore
    } finally {
      // if sending fails, we write the data back to the log
      if (!success) {
        this.appendToBuffer(contents)
      }
    }
    return true
  }

  async startFlushEvents(
    flushOperation: (contents: string) => Promise<boolean>
  ): Promise<boolean> {
    try {
      await this.flushFile(this.bufferFilePath, flushOperation)
      const files = readdirSync(this.baseDir)
      const filtered = files.filter(p => p.startsWith(`events.json`))
      for (const file of filtered) {
        await this.flushFile(path.join(this.baseDir, file), flushOperation)
      }
      return true
    } catch (e) {
      // ignore
    }
    return false
  }
}

const fs = require("fs-extra")
const path = require("path")
const log = require("loglevel")

class ImageProcessingProcessor {
  constructor(queue) {
    this.queue = queue
  }

  async process(msg) {
    if (!msg.inputPaths || msg.inputPaths.length > 1) {
      log.error("Wrong number of input paths in msg: ", msg)
      return Promise.reject("Wrong number of input paths")
    }

    const file = msg.inputPaths[0].path

    try {
      log.debug("Processing image", file)
      const result = await this.queue.process({
        id: msg.id,
        args: msg.args,
        file,
      })
      log.debug("Got output from processing")
      await Promise.all(
        result.output.map(async transform => {
          const filePath = path.join(msg.outputDir, transform.outputPath)
          try {
            await fs.mkdirp(path.dirname(filePath))
          } catch (err) {
            return Promise.reject(`Failed making output directory: ${err}`)
          }
          log.debug("Writing tranform to file")
          await fs.writeFile(
            filePath,
            Buffer.from(result.files[transform.outputPath], "base64")
          )
        })
      )
      return { output: result.output }
    } catch (err) {
      log.error("Error during processing", err)
      return Promise.reject(err)
    }
  }
}

exports.Processor = ImageProcessingProcessor

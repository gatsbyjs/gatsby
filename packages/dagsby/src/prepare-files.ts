const _ = require(`lodash`)
const fs = require(`fs-extra`)
const crypto = require(`crypto`)

let taskFiles = new Map()
const mtimes = new Map()
const digests = new Map()
const inFlight = new Map()
async function md5File(filePath) {
  if (digests.has(filePath)) {
    return digests.get(filePath)
  }

  if (inFlight.has(filePath)) {
    return inFlight.get(filePath)
  } else {
    const md5Promise = new Promise((resolve, reject) => {
      // const newMtime = fs.statSync(filePath).mtime.getTime()
      // let renew = false
      // // Has the file changed?
      // if (mtimes.has(filePath)) {
      // if (newMtime !== mtimes.get(filePath)) {
      // renew = true
      // }
      // } else {
      // renew = true
      // }

      // mtimes.set(filePath, newMtime)

      // // If we need to renew, calculate, cache and return.
      // if (renew) {
      const output = crypto.createHash("md5")
      const input = fs.createReadStream(filePath)

      input.on("error", err => {
        reject(err)
      })

      output.once("readable", () => {
        const newDigest = output.read().toString("hex")
        digests.set(filePath, newDigest)
        resolve(newDigest)
      })

      input.pipe(output)
      // } else {
      // resolve(digests.get(path))
      // }
    })

    inFlight.set(filePath, md5Promise)
    return md5Promise
  }
}

async function prepareTask(files) {
  if (files && !_.isEmpty(files)) {
    await Promise.all(
      _.toPairs(files).map(async ([name, file]) => {
        const digest = await md5File(file.originPath)
        // Discard the file path
        files[name] = { ...file, digest }
      })
    )
  }

  return files
}

module.exports = prepareTask

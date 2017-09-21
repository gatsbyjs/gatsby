import { HEADER_COMMENT } from "./constants"
import { appendFile, exists, readFile, writeFile } from "fs-extra"

export default async function writeRedirectsFile(pluginData, redirects) {
  const { publicFolder } = pluginData

  if (redirects.length > 0) {
    const FILE_PATH = publicFolder(`_redirects`)

    // Map redirect data to the format Netlify expects
    // https://www.netlify.com/docs/redirects/
    redirects = redirects.map(redirect => {
      const status = redirect.isPermanent ? 301 : 302
      return `${redirect.fromPath}  ${redirect.toPath}  ${status}`
    })

    let appendToFile = false

    // Websites may also have statically defined redirects
    // In that case we should append to them (not overwrite)
    // Make sure we aren't just looking at previous build results though
    const fileExists = await exists(FILE_PATH)
    if (fileExists) {
      const fileContents = await readFile(FILE_PATH)
      if (fileContents.indexOf(HEADER_COMMENT) < 0) {
        appendToFile = true
      }
    }

    const data = `${HEADER_COMMENT}\n\n${redirects.join(`\n`)}`

    return appendToFile
      ? appendFile(FILE_PATH, `\n\n${data}`)
      : writeFile(FILE_PATH, data)
  }
}

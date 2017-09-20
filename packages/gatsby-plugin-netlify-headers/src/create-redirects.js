import fs from "fs"
import pify from "pify"

const writeFile = pify(fs.writeFile)

export default function writeRedirectsFile(pluginData, redirects) {
  const { publicFolder } = pluginData

  // https://www.netlify.com/docs/redirects/
  const data = redirects.map(redirect => {
    const status = redirect.isPermanent ? 301 : 302
    return `${redirect.fromPath}  ${redirect.toPath}  ${status}`
  })

  return writeFile(publicFolder(`_redirects`), data.join(`\n`))
}

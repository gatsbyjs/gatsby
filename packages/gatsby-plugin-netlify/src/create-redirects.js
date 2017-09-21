import { appendFile, exists, writeFile } from "fs-extra"

export default async function writeRedirectsFile(pluginData, redirects) {
  const { publicFolder } = pluginData

  if (redirects.length > 0) {
    const FILE_PATH = publicFolder(`_redirects`)

    // https://www.netlify.com/docs/redirects/
    redirects = redirects.map(redirect => {
      const status = redirect.isPermanent ? 301 : 302
      return `${redirect.fromPath}  ${redirect.toPath}  ${status}`
    })

    const data = `## Created with gatsby-plugin-netlify\n\n${redirects.join(
      `\n`
    )}`

    const fileExists = await exists(FILE_PATH)

    return fileExists
      ? appendFile(FILE_PATH, `\n\n${data}`)
      : writeFile(FILE_PATH, data)
  }
}

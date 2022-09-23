import express from "express"
import fs from "fs-extra"

/**
 * Statically serve assets from `static` folder for tests. Reasons:
 *
 * - Making requests to third-party services we don't own can cause flakiness if the service has issues
 * - Making requests to the same site as the test doesn't simulate real behavior as well as a separate site
 */

const app = express()
const port = 8888

app.use(express.static(`static`))

app.get(`/`, (_, res) => {
  const staticFiles = fs.readdirSync(`static`)

  const staticFilesHTML = staticFiles
    .map(file => `<li><a href="${file}">${file}</a></li>`)
    .join(``)

  res.send(
    `
    This is a static file server for tests. It serves files from the <code>static</code> folder.
    Files include:
    \n<ul>${staticFilesHTML}</ul>
    `
  )
})

app.listen(port, () => {
  console.info(
    `Static file server is serving files from \`static\` and available at http://localhost:${port}`
  )
})

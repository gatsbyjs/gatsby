import fs from "fs"
import { access } from "fs-extra"
import { resolve } from "path"

import PQueue from "p-queue"
import axios from "axios"
import reporter from "gatsby-cli/lib/reporter"

const downloadQueue = new PQueue({ concurrency: 3 })

const downloadCache = {}

/**
 * Download and cache video from Contentful for further processing
 *
 * This is not using createRemoteFileNode of gatsby-source-filesystem because of:
 *
 * Retry is currently broken: https://github.com/gatsbyjs/gatsby/issues/22010
 * Downloaded files are not cached properly: https://github.com/gatsbyjs/gatsby/issues/8324 & https://github.com/gatsbyjs/gatsby/pull/8379
 */
export async function cacheContentfulVideo({ video, cacheDir }) {
  const {
    file: { url, fileName },
  } = video

  const path = resolve(cacheDir, fileName)

  try {
    await access(path, fs.constants.R_OK)
    reporter.verbose(`Already downloaded ${url}`)
    downloadCache[url] = path

    return downloadCache[url]
  } catch {
    if (url in downloadCache) {
      // Already downloading
      return downloadCache[url]
    }

    async function queuedDownload() {
      let tries = 0
      let downloaded = false

      while (!downloaded) {
        try {
          await downloadQueue.add(async () => {
            reporter.info(`Downloading ${url}`)

            const response = await axios({
              method: `get`,
              url: `https:${url}`,
              responseType: `stream`,
            })

            await new Promise((resolve, reject) => {
              const file = fs.createWriteStream(path)

              file.on(`finish`, resolve)
              file.on(`error`, reject)
              response.data.pipe(file)
            })

            downloaded = true
          })
        } catch (e) {
          tries++

          if (tries === 3) {
            throw new Error(
              `Download of ${url} failed after three times:\n\n${e}`
            )
          }
          reporter.info(
            `Unable to download ${url}\n\nRetrying again after 1s (${tries}/3)`
          )
          console.error(e)
          console.log(Object.keys(e), e.message)
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
      }

      reporter.info(`Downloaded: ${url}`)

      return path
    }

    downloadCache[url] = queuedDownload()

    return downloadCache[url]
  }
}

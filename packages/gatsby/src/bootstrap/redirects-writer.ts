import _ from "lodash"
import crypto from "crypto"
import fs from "fs-extra"
import { store, emitter } from "../redux"
import { joinPath } from "gatsby-core-utils"

let lastHash: string | null = null
let bootstrapFinished = false

export const writeRedirects = async (): Promise<void> => {
  bootstrapFinished = true

  const { program, redirects } = store.getState()

  // Filter for redirects that are meant for the browser.
  const browserRedirects = redirects
    .filter(r => r.redirectInBrowser)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    .map(
      ({ redirectInBrowser, isPermanent, ignoreCase, fromPath, ...rest }) => {
        return {
          fromPath: ignoreCase ? fromPath.toLowerCase() : fromPath,
          ignoreCase,
          ...rest,
        }
      }
    )

  const newHash = crypto
    .createHash(`md5`)
    .update(JSON.stringify(browserRedirects))
    .digest(`hex`)

  if (newHash === lastHash) {
    return
  }

  lastHash = newHash

  await fs.writeFile(
    joinPath(program.directory, `.cache/redirects.json`),
    JSON.stringify(browserRedirects, null, 2)
  )
}

const debouncedWriteRedirects = _.debounce(() => {
  // Don't write redirects again until bootstrap has finished.
  if (bootstrapFinished) {
    writeRedirects()
  }
}, 250)

export const startRedirectListener = (): void => {
  emitter.on(`CREATE_REDIRECT`, () => {
    debouncedWriteRedirects()
  })
}

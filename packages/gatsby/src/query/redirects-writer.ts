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
    .map(({ redirectInBrowser, isPermanent, ...rest }) => rest)

  const newHash = crypto
    .createHash(`md5`)
    .update(JSON.stringify(browserRedirects))
    .digest(`hex`)

  if (newHash === lastHash) {
    return Promise.resolve()
  }

  lastHash = newHash

  return await fs.writeFile(
    joinPath(program.directory, `.cache/redirects.json`),
    JSON.stringify(browserRedirects, null, 2)
  )
}

let oldRedirects
const debouncedWriteRedirects = _.debounce(() => {
  // Don't write redirects again until bootstrap has finished.
  if (
    bootstrapFinished &&
    !_.isEqual(oldRedirects, store.getState().redirects)
  ) {
    writeRedirects()
    oldRedirects = store.getState().redirects
  }
}, 250)

emitter.on(`CREATE_REDIRECT`, () => {
  debouncedWriteRedirects()
})

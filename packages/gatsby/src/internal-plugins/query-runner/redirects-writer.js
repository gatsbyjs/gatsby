import _ from "lodash"
import fs from "fs-extra"
import { store, emitter } from "../../redux/"
import { joinPath } from "../../utils/path"

let lastHash = null

const writeRedirects = async createContentDigest => {
  bootstrapFinished = true

  let { program, redirects } = store.getState()

  // Filter for redirects that are meant for the browser.
  const browserRedirects = redirects.filter(r => r.redirectInBrowser)

  const newHash = createContentDigest(browserRedirects)

  if (newHash === lastHash) {
    return Promise.resolve()
  }

  lastHash = newHash

  return await fs.writeFile(
    joinPath(program.directory, `.cache/redirects.json`),
    JSON.stringify(browserRedirects, null, 2)
  )
}

exports.writeRedirects = writeRedirects

let bootstrapFinished = false
let oldRedirects
const debouncedWriteRedirects = _.debounce(() => {
  // Don't write redirects again until bootstrap has finished.
  if (
    bootstrapFinished &&
    !_.isEqual(oldRedirects, store.getState().redirects)
  ) {
    writeRedirects()
    oldRedirects = store.getState().Redirects
  }
}, 250)

emitter.on(`CREATE_REDIRECT`, () => {
  debouncedWriteRedirects()
})

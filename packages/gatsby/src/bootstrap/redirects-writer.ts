import _ from "lodash"
import crypto from "crypto"
import fs from "fs-extra"
import { store, emitter } from "../redux"
import { IRedirect } from "../redux/types"
import { joinPath } from "gatsby-core-utils"
import reporter from "gatsby-cli/lib/reporter"

let lastHash: string | null = null
let bootstrapFinished = false

export const writeRedirects = async (): Promise<void> => {
  bootstrapFinished = true

  const { program, redirects, pages } = store.getState()

  const redirectMatchingPageWarnings: Array<string> = []
  const browserRedirects: Array<IRedirect> = []

  for (const redirect of redirects) {
    const alternativePath = redirect.fromPath.endsWith(`/`)
      ? redirect.fromPath.substr(0, redirect.fromPath.length - 1)
      : redirect.fromPath + `/`

    let hasSamePage: boolean

    if (
      (hasSamePage = pages.has(redirect.fromPath)) ||
      pages.has(alternativePath)
    ) {
      redirectMatchingPageWarnings.push(
        ` - page: "${
          hasSamePage ? redirect.fromPath : alternativePath
        }" and redirect: "${redirect.fromPath}" -> "${redirect.toPath}"`
      )
    }
    // Filter for redirects that are meant for the browser.
    if (redirect.redirectInBrowser) {
      browserRedirects.push({
        ...redirect,
        fromPath: redirect.ignoreCase
          ? redirect.fromPath.toLowerCase()
          : redirect.fromPath,
      })
    }
  }

  if (redirectMatchingPageWarnings.length > 0) {
    reporter.warn(
      `There are routes that match both page and redirect. Pages take precedence over redirects so the redirect will not work:\n${redirectMatchingPageWarnings.join(
        `\n`
      )}`
    )
  }

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

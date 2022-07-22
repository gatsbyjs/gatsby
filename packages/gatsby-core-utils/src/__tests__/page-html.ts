import os from "os"
import { generateHtmlPath } from "../page-html"

describe(`page-html`, () => {
  it(`returns correct html path`, () => {
    if (os.platform() !== `win32`) {
      expect(generateHtmlPath(`public`, `/path/1`)).toBe(
        `public/path/1/index.html`
      )

      expect(generateHtmlPath(`public`, `/path/1/index.html`)).toBe(
        `public/path/1/index.html`
      )
    }

    if (os.platform() === `win32`) {
      expect(generateHtmlPath(`public`, `/path/1`)).toBe(
        `public\\path\\1\\index.html`
      )

      expect(generateHtmlPath(`public`, `/path/1/index.html`)).toBe(
        `public\\path\\1\\index.html`
      )
    }
  })
})

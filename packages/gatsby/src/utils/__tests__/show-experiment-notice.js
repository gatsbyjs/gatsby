import { createNoticeMessage } from "../show-experiment-notice"
import stripAnsi from "strip-ansi"

describe(`show-experiment-notice`, () => {
  it(`generates a message`, () => {
    expect(
      stripAnsi(
        createNoticeMessage([
          {
            noticeText: `hi`,
            umbrellaLink: `http://example.com`,
            experimentIdentifier: `The Flag`,
          },
        ])
      )
    ).toMatchSnapshot()
  })
})

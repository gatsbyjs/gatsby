import { createNoticeMessage } from "../show-experiment-notice"

describe(`show-experiment-notice`, () => {
  it(`generates a message`, () => {
    expect(
      createNoticeMessage([
        {
          noticeText: `hi`,
          umbrellaLink: `http://example.com`,
          experimentIdentifier: `The Flag`,
        },
      ])
    ).toMatchSnapshot()
  })
})

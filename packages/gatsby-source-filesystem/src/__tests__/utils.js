jest.mock(`gatsby-cli/lib/reporter`)
jest.mock(`progress`)
const {
  getRemoteFileExtension,
  getRemoteFileName,
  createProgress,
} = require(`../utils`)
const reporter = require(`gatsby-cli/lib/reporter`)
const progress = require(`progress`)

describe(`create remote file node`, () => {
  it(`can correctly retrieve file name and extensions`, () => {
    ;[
      [
        `https://scontent.xx.fbcdn.net/v/t51.2885-15/42078503_294439751160571_1602896118583132160_n.jpg?_nc_cat=101&oh=e30490a47409051c45dc3daacf616bc0&oe=5C5EA8EB`,
        `42078503_294439751160571_1602896118583132160_n`,
        `.jpg`,
      ],
      [
        `https://facebook.com/hello,_world_asdf12341234.jpeg?test=true&other_thing=also-true`,
        `hello,_world_asdf12341234`,
        `.jpeg`,
      ],
      [`https://test.com/asdf.png`, `asdf`, `.png`],
      [`./path/to/relative/file.tiff`, `file`, `.tiff`],
      [`/absolutely/this/will/work.bmp`, `work`, `.bmp`],
    ].forEach(([url, name, ext]) => {
      expect(getRemoteFileName(url)).toBe(name)
      expect(getRemoteFileExtension(url)).toBe(ext)
    })
  })
})

describe(`createProgress`, () => {
  beforeEach(() => {
    progress.mockClear()
  })

  it(`should use createProgress from gatsby-cli when available`, () => {
    createProgress(`test`, reporter)
    expect(reporter.createProgress).toBeCalled()
    expect(progress).not.toBeCalled()
  })

  it(`should fallback to a local implementation when createProgress does not exists on reporter`, () => {
    reporter.createProgress = null
    const bar = createProgress(`test`, reporter)
    expect(progress).toHaveBeenCalledTimes(1)
    expect(bar).toHaveProperty(`start`, expect.any(Function))
    expect(bar).toHaveProperty(`tick`, expect.any(Function))
    expect(bar).toHaveProperty(`done`, expect.any(Function))
    expect(bar).toHaveProperty(`total`)
  })

  it(`should fallback to a local implementation when no reporter is present`, () => {
    const bar = createProgress(`test`)
    expect(progress).toHaveBeenCalledTimes(1)
    expect(bar).toHaveProperty(`start`, expect.any(Function))
    expect(bar).toHaveProperty(`tick`, expect.any(Function))
    expect(bar).toHaveProperty(`done`, expect.any(Function))
    expect(bar).toHaveProperty(`total`)
  })
})

const { getRemoteFileExtension } = require(`../utils`)

describe(`create remote file node`, () => {
  it(`can correctly retrieve files extensions`, () => {
    ;[
      [
        `https://scontent.xx.fbcdn.net/v/t51.2885-15/42078503_294439751160571_1602896118583132160_n.jpg?_nc_cat=101&oh=e30490a47409051c45dc3daacf616bc0&oe=5C5EA8EB`,
        `.jpg`,
      ],
      [
        `https://facebook.com/hello,_world_asdf12341234.jpeg?test=true&other_thing=also-true`,
        `.jpeg`,
      ],
      [`https://test.com/asdf.png`, `.png`],
      [`./path/to/relative/file.tiff`, `.tiff`],
      [`/absolutely/this/will/work.bmp`, `.bmp`],
    ].forEach(([url, ext]) => {
      expect(getRemoteFileExtension(url)).toBe(ext)
    })
  })
})

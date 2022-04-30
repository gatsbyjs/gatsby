/**
 * @jest-environment jsdom
 */

const { onRouteUpdate } = require(`../gatsby-browser`)

describe(`gatsby-plugin-canonical-urls`, () => {
  beforeEach(() => {
    global.document.head.innerHTML = `<link data-basehost="someurl.com" data-baseprotocol="http:" href="http://someurl.com/somepost" rel="canonical"
        />`
  })

  it(`should update the href`, () => {
    onRouteUpdate({ location: { pathname: `/hogwarts`, hash: ``, search: `` } })

    expect(global.document.head.innerHTML).toMatchInlineSnapshot(
      `"<link data-basehost=\\"someurl.com\\" data-baseprotocol=\\"http:\\" href=\\"http://someurl.com/hogwarts\\" rel=\\"canonical\\">"`
    )
  })
  it(`should keep the hash`, () => {
    onRouteUpdate({
      location: { pathname: `/hogwarts`, hash: `#harry-potter`, search: `` },
    })

    expect(global.document.head.innerHTML).toMatchInlineSnapshot(
      `"<link data-basehost=\\"someurl.com\\" data-baseprotocol=\\"http:\\" href=\\"http://someurl.com/hogwarts#harry-potter\\" rel=\\"canonical\\">"`
    )
  })
  it(`shouldn't strip search parameter by default`, () => {
    onRouteUpdate({
      location: {
        pathname: `/hogwarts`,
        hash: ``,
        search: `?house=gryffindor`,
      },
    })

    expect(global.document.head.innerHTML).toMatchInlineSnapshot(
      `"<link data-basehost=\\"someurl.com\\" data-baseprotocol=\\"http:\\" href=\\"http://someurl.com/hogwarts?house=gryffindor\\" rel=\\"canonical\\">"`
    )
  })
  it(`should strip search parameters if option stripQueryString is true`, () => {
    const pluginOptions = {
      stripQueryString: true,
    }

    onRouteUpdate(
      {
        location: {
          pathname: `/hogwarts`,
          hash: ``,
          search: `?house=gryffindor`,
        },
      },
      pluginOptions
    )

    expect(global.document.head.innerHTML).toMatchInlineSnapshot(
      `"<link data-basehost=\\"someurl.com\\" data-baseprotocol=\\"http:\\" href=\\"http://someurl.com/hogwarts\\" rel=\\"canonical\\">"`
    )
  })
})

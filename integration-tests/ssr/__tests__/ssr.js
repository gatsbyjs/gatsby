const fetch = require(`node-fetch`)

describe(`SSR`, () => {
  test(`is run for a page when it is requested`, async () => {
    const html = await fetch(`http://localhost:8000/`).then(res => res.text())

    expect(html).toMatchSnapshot()
  })
})

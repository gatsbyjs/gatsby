const fetch = require(`node-fetch`)
const execa = require(`execa`)
const fs = require(`fs-extra`)
const path = require(`path`)

describe(`SSR`, () => {
  test(`is run for a page when it is requested`, async () => {
    const html = await fetch(`http://localhost:8000/`).then(res => res.text())

    expect(html).toMatchSnapshot()
  })

  test(`dev & build outputs match`, async () => {
    const childProcess = await execa(`yarn`, [`test-output`])

    expect(childProcess.code).toEqual(0)
  }, 15000)

  test(`it generates an error page correctly`, async () => {
    const src = path.join(__dirname, `/fixtures/bad-page.js`)
    const dest = path.join(__dirname, `../src/pages/bad-page.js`)
    fs.copySync(src, dest)

    const pageUrl = `http://localhost:8000/bad-page/`
    await new Promise(resolve => {
      // Poll until the new page is bundled (so starts returning a non-404 status).
      const testInterval = setInterval(() => {
        fetch(pageUrl).then(res => {
          if (res.status !== 404) {
            clearInterval(testInterval)
            resolve()
          }
        })
      }, 1000)
    })

    const rawDevHtml = await fetch(
      `http://localhost:8000/bad-page/`
    ).then(res => res.text())
    expect(rawDevHtml).toMatchSnapshot()
    fs.remove(dest)

    // After the page is gone, it'll 404.
    await new Promise(resolve => {
      setTimeout(() => {
        const testInterval = setInterval(() => {
          fetch(pageUrl).then(res => {
            if (res.status === 404) {
              clearInterval(testInterval)
              resolve()
            }
          })
        }, 400)
      }, 400)
    })
  })
})

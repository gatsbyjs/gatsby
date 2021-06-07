const fetch = require(`node-fetch`)
const execa = require(`execa`)
const fs = require(`fs-extra`)
const path = require(`path`)

function fetchUntil(url, filter, timeout = 1000) {
  return new Promise(resolve => {
    fetch(url).then(res => {
      if (filter(res)) {
        resolve(res)
      } else {
        setTimeout(() => {
          resolve(fetchUntil(url, filter, timeout))
        }, timeout)
      }
    })
  })
}

describe(`SSR`, () => {
  test(`is run for a page when it is requested`, async () => {
    const html = await fetch(`http://localhost:8000/`).then(res => res.text())

    expect(html).toMatchSnapshot()
  })

  test(`dev & build outputs match`, async () => {
    console.log(`sanity check`)
    const childProcess = await execa(`yarn`, [`test-output`])
    console.log(childProcess.stdout)

    expect(childProcess.code).toEqual(0)
  }, 15000)

  test(`it generates an error page correctly`, async () => {
    const src = path.join(__dirname, `/fixtures/bad-page.js`)
    const dest = path.join(__dirname, `../src/pages/bad-page.js`)
    fs.copySync(src, dest)

    const pageUrl = `http://localhost:8000/bad-page/`
    // Poll until the new page is bundled (so starts returning a non-404 status).
    const rawDevHtml = await fetchUntil(pageUrl, res => {
      return res
    }).then(res => res.text())
    expect(rawDevHtml).toMatchSnapshot()
    await fs.remove(dest)

    // After the page is gone, it'll 404.
    // TODO FIX as this isn't working
    // await fetchUntil(pageUrl, res => res.status === 404)
  }, 15000)
})

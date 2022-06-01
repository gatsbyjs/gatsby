const fetch = require(`node-fetch`)
const execa = require(`execa`)
const fs = require(`fs-extra`)
const path = require(`path`)

function fetchUntil(url, filter, timeout = 1000) {
  return new Promise(resolve => {
    fetch(url, {
      headers: {
        "x-gatsby-wait-for-dev-ssr": `1`,
      },
    }).then(res => {
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
  const badPageDest = path.join(__dirname, `../src/pages/bad-page.js`)

  afterAll(() => {
    if (fs.existsSync(badPageDest)) {
      fs.removeSync(badPageDest)
    }
  })

  test(`is run for a page when it is requested`, async () => {
    const html = await fetch(`http://localhost:8000/`, {
      headers: {
        "x-gatsby-wait-for-dev-ssr": `1`,
      },
    }).then(res => res.text())

    expect(html).toMatchSnapshot()
  })

  test(`dev & build outputs match`, async () => {
    const childProcess = await execa(`yarn`, [`test-output`])

    expect(childProcess.exitCode).toEqual(0)

    // Additional sanity-check
    expect(String(childProcess.stdout)).toContain(
      `testing these paths for differences between dev & prod outputs`
    )
  }, 180000)

  test(`it generates an error page correctly`, async () => {
    const src = path.join(__dirname, `/fixtures/bad-page.js`)
    fs.copySync(src, badPageDest)

    const pageUrl = `http://localhost:8000/bad-page/`
    // Poll until the new page is bundled (so starts returning a non-404 status).
    const rawDevHtml = await fetchUntil(pageUrl, res => {
      return res.status !== 404
    }).then(res => res.text())

    expect(rawDevHtml).toMatch("<h1>Failed to Server Render (SSR)</h1>")
    expect(rawDevHtml).toMatch("<h2>Error message:</h2>")
    expect(rawDevHtml).toMatch("<p>window is not defined</p>")
    // html should contain stacktrace to bad-page
    expect(rawDevHtml).toMatch(/at Component \(.+?(?=bad-page.js)[^)]+\)/)
    await fs.remove(dest)

    // After the page is gone, it'll 404.
    // TODO FIX as this isn't working
    // await fetchUntil(pageUrl, res => res.status === 404)
  }, 60000)
})

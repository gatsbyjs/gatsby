const fetch = require(`node-fetch`)
const execa = require(`execa`)
const fs = require(`fs-extra`)
const path = require(`path`)
const { parse } = require(`node-html-parser`)

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
  test(`is run for a page when it is requested`, async () => {
    const html = await fetch(`http://localhost:8000/`, {
      headers: {
        "x-gatsby-wait-for-dev-ssr": `1`,
      },
    }).then(res => res.text())

    expect(html).toMatchSnapshot()
  }, 30000)

  test(`dev & build outputs match`, async () => {
    const childProcess = await execa(`yarn`, [`test-output`])

    expect(childProcess.exitCode).toEqual(0)

    // Additional sanity-check
    expect(String(childProcess.stdout)).toContain(
      `testing these paths for differences between dev & prod outputs`
    )
  }, 180000)

  test(`dev & build outputs have matching head elements from Head function export`, async () => {
    const devSsrHtml = await fetch(
      `http://localhost:8000/head-function-export`,
      {
        headers: {
          "x-gatsby-wait-for-dev-ssr": `1`,
        },
      }
    ).then(res => res.text())
    const devSsrDom = parse(devSsrHtml)
    const devSsrHead = devSsrDom.querySelector(`[data-testid=title]`)

    const ssrHtml = await fs.readFile(
      `${__dirname}/../public/head-function-export/index.html`,
      `utf8`
    )
    const ssrDom = parse(ssrHtml)
    const ssrHead = ssrDom.querySelector(`[data-testid=title]`)

    expect(devSsrHead.textContent).toEqual(ssrHead.textContent)
    expect(devSsrDom.querySelector(`html`).attributes).toEqual(
      ssrDom.querySelector(`html`).attributes
    )
    expect(devSsrDom.querySelector(`html`).attributes).toMatchInlineSnapshot(`
      Object {
        "data-foo": "bar",
        "lang": "fr",
      }
    `)

    expect(devSsrDom.querySelector(`body`).attributes).toEqual(
      ssrDom.querySelector(`body`).attributes
    )
    expect(devSsrDom.querySelector(`body`).attributes).toMatchInlineSnapshot(`
      Object {
        "data-foo": "baz",
      }
    `)
  })

  describe(`it generates an error page correctly`, () => {
    const badPages = [
      {
        fixture: `bad-page.js`,
        pagePath: `/bad-page/`,
        title: `browser API used in page template render method`,
        assert: rawDevHtml => {
          expect(rawDevHtml).toMatch(/<p>.*window is not defined<\/p>/)
          // html should contain stacktrace to bad-page
          expect(rawDevHtml).toMatch(/at.*bad-page.js/)
        },
      },
      {
        fixture: `bad-ssr.js`,
        pagePath: `/bad-ssr/`,
        title: `handling failing getServerData`,
        assert: rawDevHtml => {
          expect(rawDevHtml).toMatch(/<p>.*network error, I swear<\/p>/)
          // html should contain stacktrace to bad-ssr
          expect(rawDevHtml).toMatch(/at.*bad-ssr.js/)
        },
      },
    ]
    function getSrcLoc(fixture) {
      return path.join(__dirname, `../src/pages`, fixture)
    }

    afterAll(() => {
      for (const { fixture } of badPages) {
        const dest = getSrcLoc(fixture)
        if (fs.existsSync(dest)) {
          fs.removeSync(dest)
        }
      }
    })

    for (const {
      pagePath,
      fixture,
      title,
      assert: testSpecificAssertions,
    } of badPages) {
      it(
        title,
        async () => {
          const src = path.join(__dirname, `/fixtures/`, fixture)
          const dest = getSrcLoc(fixture)
          fs.copySync(src, dest)

          const pageUrl = `http://localhost:8000${pagePath}`

          // Poll until the new page is bundled (so starts returning a non-404 status).
          const rawDevHtml = await fetchUntil(pageUrl, res => {
            return res.status !== 404
          }).then(res => res.text())

          expect(rawDevHtml).toMatch("<h1>Failed to Server Render (SSR)</h1>")
          expect(rawDevHtml).toMatch("<h2>Error message:</h2>")

          if (testSpecificAssertions) {
            await testSpecificAssertions(rawDevHtml)
          }
        },
        60000
      )
    }
  })
})

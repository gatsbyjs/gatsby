const fetch = require(`node-fetch`)
const { execFile } = require("child_process")
const fs = require(`fs-extra`)
const path = require(`path`)

describe(`SSR`, () => {
  test(`is run for a page when it is requested`, async () => {
    const html = await fetch(`http://localhost:8000/`).then(res => res.text())

    expect(html).toMatchSnapshot()
  })
  test(`dev & build outputs match`, async () => {
    const childProcess = execFile(`yarn`, [`test-output`])
    let exitCode
    await new Promise(resolve => {
      childProcess.on(`exit`, code => {
        exitCode = { exitCode: code }
        resolve()
      })
    })

    expect(exitCode).toEqual({ exitCode: 0 })
  })
  test(`it generates an error page correctly`, async () => {
    const src = path.join(__dirname, `/fixtures/bad-page.js`)
    const dest = path.join(__dirname, `../src/pages/bad-page.js`)
    const result = fs.copySync(src, dest)

    const pageUrl = `http://localhost:8000/bad-page/`
    await new Promise(resolve => {
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
      const testInterval = setInterval(() => {
        fetch(pageUrl).then(res => {
          if (res.status === 404) {
            clearInterval(testInterval)
            resolve()
          }
        })
      }, 400)
    })
  })
})

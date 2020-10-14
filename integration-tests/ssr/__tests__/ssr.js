const fetch = require(`node-fetch`)
const { execFile } = require("child_process")

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
})

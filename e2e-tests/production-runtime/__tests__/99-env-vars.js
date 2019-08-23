const { exec } = require(`child_process`)

function grepJSFilesFor(str) {
  return new Promise(resolve => {
    const grep = exec(`grep -r "${str}" ./public/*.js`)

    grep.stdout.on(`data`, () => {
      resolve(true)
      return
    })

    grep.on(`close`, () => {
      resolve(false)
      return
    })
  })
}

describe(`environment secrets`, () => {
  it(`doesn't leak VERY_SECRET_VAR`, async () => {
    const isLeaked = await grepJSFilesFor(`VERY_SECRET_VAR`)
    expect(isLeaked).toBe(false)
  })

  it(`doesn't leak "it's a secret"`, async () => {
    const isLeaked = await grepJSFilesFor(`it's a secret`)
    expect(isLeaked).toBe(false)
  })
})

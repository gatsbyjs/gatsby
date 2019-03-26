const sanitize = require(`../sanitize-error`)

describe(`sanitize errors`, () => {
  it(`Removes env, output and converts buffers to strings from execa output`, () => {
    const tags = {
      error: [
        {
          error: null,
          cmd: `git commit -m"test"`,
          file: `/bin/sh`,
          args: [`/bin/sh`, `-c`, `git commit -m"test`],
          options: {
            cwd: `here`,
            shell: true,
            envPairs: [`VERSION=1.2.3`],
            stdio: [{}, {}, {}], // pipes
          },
          envPairs: [`VERSION=1.2.3`],

          stderr: Buffer.from(`this is a test`),
          stdout: Buffer.from(`this is a test`),
        },
      ],
    }

    const error = tags.error[0]
    expect(error).toBeDefined()
    expect(error.envPairs).toBeDefined()
    expect(error.options).toBeDefined()

    expect(typeof error.stdout).toEqual(`object`)

    sanitize(tags)
    expect(typeof error.stdout).toEqual(`string`)

    expect(error).toBeDefined()
    expect(error.envPairs).toBeUndefined()
    expect(error.options).toBeUndefined()
  })

  it(`Sanitizes current path from error stracktraces`, () => {
    const errormessage = `this is a test`
    let e
    try {
      throw new Error(errormessage)
    } catch (error) {
      e = error
    }
    expect(e).toBeDefined()
    expect(e.message).toEqual(errormessage)
    expect(e.stack).toBeDefined()
    const localPathRegex = new RegExp(
      process.cwd().replace(/[-[/{}()*+?.\\^$|]/g, `\\$&`)
    )
    expect(localPathRegex.test(e.stack)).toBeTruthy()
    const tags = { error: [e] }

    sanitize(tags)

    expect(localPathRegex.test(e.stack)).toBeFalsy()
  })
})

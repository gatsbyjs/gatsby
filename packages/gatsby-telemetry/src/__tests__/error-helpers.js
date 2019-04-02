const { sanitizeError, cleanPaths } = require(`../error-helpers`)

describe(`Errors Helpers`, () => {
  describe(`sanitizeError`, () => {
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

            stderr: Buffer.from(`this is a an error`),
            stdout: Buffer.from(`this is a test`),
          },
        ],
      }

      sanitizeError(tags)
      const error = tags.error[0]
      expect(error.stderr).toStrictEqual(`this is a an error`)
      expect(error.stdout).toStrictEqual(`this is a test`)
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

      sanitizeError(tags)

      expect(localPathRegex.test(e.stack)).toBeFalsy()
    })
  })
  describe(`cleanPaths`, () => {
    it(`cleans unix paths`, () => {
      const mockPath = `/Users/username/gatsby/packages/gatsby-telemetry`

      const mockCwd = jest
        .spyOn(process, `cwd`)
        .mockImplementation(() => mockPath)

      const errormessage = `this${mockPath}is\n${mockPath}a test: ${mockPath}`

      expect(cleanPaths(errormessage)).toBe(`this$PWDis\n$PWDa test: $PWD`)
      mockCwd.mockRestore()
    })
    it(`cleans Windows paths`, () => {
      const mockPath = `C:\\Users\\username\\gatsby\\packages\\gatsby-telemetry`

      const mockCwd = jest
        .spyOn(process, `cwd`)
        .mockImplementation(() => mockPath)

      const errormessage = `this${mockPath}is\n${mockPath}a test: ${mockPath}`

      expect(cleanPaths(errormessage)).toBe(`this$PWDis\n$PWDa test: $PWD`)
      mockCwd.mockRestore()
    })
  })
})

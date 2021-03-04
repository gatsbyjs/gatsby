import { slash } from "gatsby-core-utils"
import { CoreJSResolver } from "../corejs-resolver"

function executeResolve(
  resolver: CoreJSResolver,
  request: { request: string },
  doResolveMock: unknown
): Promise<string> {
  return new Promise((resolve, reject) => {
    const webpackResolver = {
      doResolve: doResolveMock,
      ensureHook: (hook: string): string => hook,
      getHook: (): Record<string, unknown> => {
        return {
          tapAsync: (
            _name: string,
            fn: (...args: Array<unknown>) => void
          ): void => {
            fn(request, null, (err, result) =>
              err ? reject(err) : resolve(result)
            )
          },
        }
      },
    }

    resolver.apply(webpackResolver)
  })
}

describe(`CoreJSResolver`, () => {
  it(`should convert core-js@2 file to core-js@3`, async () => {
    const resolver = new CoreJSResolver()

    // eslint-disable-next-line @typescript-eslint/naming-convention
    const doResolve = jest.fn((_, request, __, ___, callback) =>
      callback(null, slash(request.request))
    )

    expect(
      await executeResolve(
        resolver,
        { request: `core-js/modules/es6.array.split.js` },
        doResolve
      )
    ).toEqual(expect.stringContaining(`core-js/modules/es.array.split.js`))
  })

  it(`should convert es6.regexp.replace to it's corejs@3 equivalent`, async () => {
    const resolver = new CoreJSResolver()

    // eslint-disable-next-line @typescript-eslint/naming-convention
    const doResolve = jest.fn((_, request, __, ___, callback) =>
      callback(null, slash(request.request))
    )

    expect(
      await executeResolve(
        resolver,
        { request: `core-js/modules/es6.regexp.replace.js` },
        doResolve
      )
    ).toEqual(expect.stringContaining(`core-js/modules/es.string.replace.js`))
  })

  it(`should ignore non corejs requests`, async () => {
    const resolver = new CoreJSResolver()

    const doResolve = jest.fn()

    expect(
      await executeResolve(
        resolver,
        { request: `gatsby/not/core-js.js` },
        doResolve
      )
    ).toBeUndefined()
    expect(doResolve).not.toHaveBeenCalled()
  })
})

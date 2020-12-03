import { installPlugins } from "../install-plugins"
import { reporter } from "../reporter"
import { requireResolve } from "../require-utils"

jest.mock(`../require-utils`)
jest.mock(`../reporter`)

jest.mock(
  `somewhere-virtually-existing`,
  () => {
    // Make sure not to resolve `addPlugins` in order to safely handle error
    return {}
  },
  { virtual: true }
)

describe(`install-plugins`, () => {
  afterEach(() => {
    jest.resetAllMocks()
  })

  it(`reports an error explaining that gatsby is not installed`, async () => {
    ;(requireResolve as any).mockImplementation(() => undefined)

    await installPlugins([], {}, `not-existing-path`, [])

    // Test function behaviour but improves the DX, it probably worth it
    expect(reporter.error).toBeCalledWith(
      `Could not find "gatsby" in not-existing-path. Perhaps it wasn't installed properly?`
    )
  })

  it(`reports an error when the gatsby cli is not installed`, async () => {
    ;(requireResolve as any).mockImplementation(path => {
      if (path === `gatsby-cli/lib/handlers/plugin-add`) {
        throw new Error()
      }
      return `somewhere-i-belong`
    })

    await installPlugins([], {}, `not-existing-path`, [])

    // Test function behaviour but improves the DX, it probably worth it
    expect(reporter.error).toBeCalledWith(
      `gatsby-cli not installed, or is too old`
    )
  })

  it(`reports an error when add plugins fails somehow`, async () => {
    ;(requireResolve as any).mockImplementation(
      () => `somewhere-virtually-existing`
    )

    await installPlugins([], {}, `not-existing-path`, [])

    // Test function behaviour but improves the DX, it probably worth it
    expect(reporter.error).toBeCalledWith(
      `Something went wrong when trying to add the plugins to the project: addPlugins is not a function`
    )
  })
})

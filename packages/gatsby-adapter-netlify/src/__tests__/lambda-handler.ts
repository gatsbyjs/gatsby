import { cwd } from "node:process"
import { join, relative } from "node:path"
import { removeSync } from "fs-extra"
import { slash } from "gatsby-core-utils/path"

jest.mock(`fs`, () => {
  return {
    ...jest.requireActual(`fs`),
    writeFileSync: jest.fn(),
  }
})

import { writeFileSync } from "fs"
import { prepareFunction } from "../lambda-handler"

const fixturePath = join(
  relative(cwd(), __dirname),
  `fixtures`,
  `lambda-handler`
)
const pathToEntryPoint = join(fixturePath, `entry.js`)
const requiredFile = join(fixturePath, `included.js`)

afterAll(() => {
  removeSync(join(cwd(), `.netlify`))
})

function getWrittenHandler(functionId: string): string {
  const call = jest
    .mocked(writeFileSync)
    .mock.calls.find(([filePath]) =>
      (filePath as string).endsWith(`${functionId}.mjs`)
    )

  if (!call) {
    throw new Error(`No handler was written for function "${functionId}"`)
  }

  return call[1] as string
}

describe(`prepareFunction`, () => {
  it(`produces a handler that imports the entrypoint`, async () => {
    await prepareFunction(
      {
        functionId: `test`,
        name: `SSR & DSG`,
        pathToEntryPoint,
        requiredFiles: [requiredFile],
      },
      [`/some-page/`]
    )

    const handlerCode = getWrittenHandler(`test`)

    // expect the entrypoint import in produced code (this is mostly to make sure handlerCode is actual handler code)
    expect(handlerCode).toMatch(
      /import \* as functionModule from ["'][^"']*["']/
    )
    // import paths should not have backward slashes (win paths)
    expect(handlerCode).not.toMatch(/from ["'][^"']*\\[^"']*["']/)

    expect(handlerCode).toContain(`generator: 'gatsby-adapter-netlify`)
    expect(handlerCode).toContain(`name: 'Gatsby SSR & DSG'`)
    expect(handlerCode).toContain(`nodeBundler: 'none'`)
    expect(handlerCode).toContain(slash(requiredFile))
  })

  it(`caches responses the engine marks as cacheable`, async () => {
    await prepareFunction(
      {
        functionId: `cache-test`,
        name: `SSR & DSG`,
        pathToEntryPoint,
        requiredFiles: [requiredFile],
      },
      [`/some-page/`]
    )

    const handlerCode = getWrittenHandler(`cache-test`)

    // caching is driven by the engine's onPageResponse hook, so the handler
    // neither resolves the page itself nor needs an On-demand Builder variant
    expect(handlerCode).toContain(`onPageResponse({ cache })`)
    expect(handlerCode).toContain(`netlify-cdn-cache-control`)
    // a deferred response must not be split across query strings
    expect(handlerCode).toContain(`netlify-vary', 'query='`)
    expect(handlerCode).not.toContain(`findEnginePageByPath`)
  })

  it(`declares the page paths it answers on, accepting either slashing`, async () => {
    await prepareFunction(
      {
        functionId: `routing-test`,
        name: `SSR & DSG`,
        pathToEntryPoint,
        requiredFiles: [requiredFile],
      },
      [`/some-page/`, `/other-page`]
    )

    const handlerCode = getWrittenHandler(`routing-test`)

    expect(handlerCode).toContain(`path: ["/some-page{/}?","/other-page{/}?"]`)
    expect(handlerCode).toContain(`preferStatic: true`)
  })

  it(`leaves a splat path alone rather than making its slash optional`, async () => {
    await prepareFunction(
      {
        functionId: `splat-test`,
        name: `/api/wildcard/[...]`,
        pathToEntryPoint,
        requiredFiles: [requiredFile],
      },
      [`/api/wildcard/*`]
    )

    expect(getWrittenHandler(`splat-test`)).toContain(
      `path: ["/api/wildcard/*"]`
    )
  })

  it(`declares API route paths the same way, from the routes manifest`, async () => {
    await prepareFunction(
      {
        functionId: `api-test`,
        name: `/api/param/[slug]`,
        pathToEntryPoint,
        requiredFiles: [requiredFile],
      },
      // the manifest already resolved the prefix, slashing and param syntax
      [`/prefix/api/param/:slug`]
    )

    expect(getWrittenHandler(`api-test`)).toContain(
      `path: ["/prefix/api/param/:slug{/}?"]`
    )
  })
})

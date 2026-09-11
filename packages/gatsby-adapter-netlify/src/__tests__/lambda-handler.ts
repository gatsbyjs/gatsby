import { cwd } from "node:process"
import { join, relative } from "node:path"
import { removeSync } from "fs-extra"
import { slash } from "gatsby-core-utils/path"

jest.mock(`node:fs`, () => {
  return {
    ...jest.requireActual(`node:fs`),
    writeFileSync: jest.fn(),
  }
})

import { writeFileSync } from "node:fs"
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
    await prepareFunction({
      functionId: `test`,
      name: `SSR & DSG`,
      pathToEntryPoint,
      requiredFiles: [requiredFile],
    })

    const handlerCode = getWrittenHandler(`test`)

    // expect dynamic import in produced code (this is mostly to make sure handlerCode is actual handler code)
    expect(handlerCode).toMatch(/import\(["'][^"']*["']\)/)
    // import paths should not have backward slashes (win paths)
    expect(handlerCode).not.toMatch(/import\(["'][^"']*\\[^"']*["']\)/)

    expect(handlerCode).toContain(`generator: 'gatsby-adapter-netlify`)
    expect(handlerCode).toContain(`name: 'Gatsby SSR & DSG'`)
    expect(handlerCode).toContain(`nodeBundler: 'none'`)
    expect(handlerCode).toContain(slash(requiredFile))
  })

  it(`caches responses the engine marks as cacheable`, async () => {
    await prepareFunction({
      functionId: `cache-test`,
      name: `SSR & DSG`,
      pathToEntryPoint,
      requiredFiles: [requiredFile],
    })

    const handlerCode = getWrittenHandler(`cache-test`)

    // caching is driven by the engine's onPageResponse hook, so the handler
    // neither resolves the page itself nor needs an On-demand Builder variant
    expect(handlerCode).toContain(`onPageResponse({ cache })`)
    expect(handlerCode).toContain(`netlify-cdn-cache-control`)
    expect(handlerCode).not.toContain(`findEnginePageByPath`)
  })

  it(`leaves routing to the redirects generated from the routes manifest`, async () => {
    await prepareFunction({
      functionId: `routing-test`,
      name: `/api/test`,
      pathToEntryPoint,
      requiredFiles: [requiredFile],
    })

    const handlerCode = getWrittenHandler(`routing-test`)

    expect(handlerCode).not.toContain(`path:`)
    expect(handlerCode).not.toContain(`preferStatic`)
  })

  it(`uses the same handler shape for API routes`, async () => {
    await prepareFunction({
      functionId: `api-test`,
      name: `/api/test`,
      pathToEntryPoint,
      requiredFiles: [requiredFile],
    })

    expect(getWrittenHandler(`api-test`)).toBe(
      getWrittenHandler(`routing-test`)
    )
  })
})

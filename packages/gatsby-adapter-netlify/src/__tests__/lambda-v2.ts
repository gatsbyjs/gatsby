import { cwd } from "node:process"
import { join, relative } from "node:path"
import { outputFileSync, removeSync } from "fs-extra"
import { slash } from "gatsby-core-utils/path"

jest.mock(`node:fs`, () => {
  return {
    ...jest.requireActual(`node:fs`),
    writeFileSync: jest.fn(),
  }
})

import { writeFileSync } from "node:fs"
import { prepareFunction } from "../lambda-v2"

const fixturePath = join(relative(cwd(), __dirname), `fixtures`, `lambda-v2`)
const pathToEntryPoint = join(fixturePath, `entry.js`)
const requiredFile = join(fixturePath, `included.js`)

// lambda-v2's SSR/DSG handler resolves the page-ssr engine from a hardcoded
// cwd-relative path at generation time, so it needs to exist on disk.
const pageSsrEntryPoint = join(cwd(), `.cache`, `page-ssr`, `index.js`)

beforeAll(() => {
  outputFileSync(
    pageSsrEntryPoint,
    `exports.findEnginePageByPath = () => undefined\n`
  )
})

afterAll(() => {
  removeSync(join(cwd(), `.cache`))
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
  describe(`SSR/DSG routes`, () => {
    it(`produces a handler that imports the entrypoint and page-ssr engine`, async () => {
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
      // resolves the page-ssr engine rather than a Netlify Functions builder
      expect(handlerCode).toContain(`findEnginePageByPath`)

      expect(handlerCode).toContain(`generator: 'gatsby-adapter-netlify`)
      expect(handlerCode).toContain(`name: 'Gatsby SSR + DSG'`)
      expect(handlerCode).toContain(`nodeBundler: 'none'`)
      expect(handlerCode).toContain(`path: '/*'`)
      expect(handlerCode).toContain(`preferStatic: true`)
      expect(handlerCode).toContain(slash(requiredFile))
    })
  })

  describe(`API routes`, () => {
    it(`produces a handler scoped to the API route's own path`, async () => {
      await prepareFunction({
        functionId: `api-test`,
        name: `/api/test`,
        pathToEntryPoint,
        requiredFiles: [requiredFile],
      })

      const handlerCode = getWrittenHandler(`api-test`)

      expect(handlerCode).toMatch(/import\(["'][^"']*["']\)/)
      expect(handlerCode).not.toMatch(/import\(["'][^"']*\\[^"']*["']\)/)
      // API routes don't need the page-ssr engine lookup
      expect(handlerCode).not.toContain(`findEnginePageByPath`)

      expect(handlerCode).toContain(`generator: 'gatsby-adapter-netlify`)
      expect(handlerCode).toContain(`name: 'Gatsby /api/test'`)
      expect(handlerCode).toContain(`nodeBundler: 'none'`)
      expect(handlerCode).toContain(`path: '/api/test'`)
      expect(handlerCode).not.toContain(`preferStatic`)
      expect(handlerCode).toContain(slash(requiredFile))
    })
  })
})

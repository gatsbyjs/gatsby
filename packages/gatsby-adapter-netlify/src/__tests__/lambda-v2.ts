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
  // Only remove what this test actually creates. Nuking the whole `.cache`
  // directory (which is shared with other test files running in the same
  // `--runInBand` process) can hit an EBUSY/unlink error on Windows if
  // gatsby-core-utils' LMDB env under `.cache/data` is still open elsewhere
  // in the process.
  removeSync(join(cwd(), `.cache`, `page-ssr`))
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
      await prepareFunction(
        {
          functionId: `test`,
          name: `SSR & DSG`,
          pathToEntryPoint,
          requiredFiles: [requiredFile],
        },
        [`/blog/:slug/`, `/page-data/blog/:slug/page-data.json`],
        ``
      )

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

      // trailing slash is made optional since the request may or may not
      // include one regardless of the trailingSlash option; page-data.json
      // paths are left untouched since they're fixed asset names
      expect(handlerCode).toContain(
        `path: ["/blog/:slug{/}?","/page-data/blog/:slug/page-data.json"]`
      )

      expect(handlerCode).toContain(`preferStatic: true`)
      expect(handlerCode).toContain(slash(requiredFile))
    })

    it(`passes through paths as-is, since routesManifest already applies pathPrefix`, async () => {
      await prepareFunction(
        {
          functionId: `test-prefix`,
          name: `SSR & DSG`,
          pathToEntryPoint,
          requiredFiles: [requiredFile],
        },
        [`/prefix/blog/:slug/`],
        `/prefix`
      )

      const handlerCode = getWrittenHandler(`test-prefix`)
      expect(handlerCode).toContain(`path: ["/prefix/blog/:slug{/}?"]`)
    })

    it(`makes the trailing slash optional so the request's exact slashing doesn't matter`, async () => {
      await prepareFunction(
        {
          functionId: `test-trailing-slash`,
          name: `SSR & DSG`,
          pathToEntryPoint,
          requiredFiles: [requiredFile],
        },
        [
          `/`,
          `/blog/`,
          `/blog/:slug/`,
          `/app/*`,
          `/page-data/blog/page-data.json`,
        ],
        ``
      )

      const handlerCode = getWrittenHandler(`test-trailing-slash`)
      expect(handlerCode).toContain(
        `path: ["/","/blog{/}?","/blog/:slug{/}?","/app/*","/page-data/blog/page-data.json"]`
      )
    })
  })

  describe(`API routes`, () => {
    it(`produces a handler scoped to the API route's own path`, async () => {
      await prepareFunction(
        {
          functionId: `api-test`,
          name: `/api/test`,
          pathToEntryPoint,
          requiredFiles: [requiredFile],
        },
        [`/api/test`],
        ``
      )

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

    it(`prepends pathPrefix to the API route's path`, async () => {
      await prepareFunction(
        {
          functionId: `api-test-prefix`,
          name: `/api/test`,
          pathToEntryPoint,
          requiredFiles: [requiredFile],
        },
        [`/prefix/api/test`],
        `/prefix`
      )

      const handlerCode = getWrittenHandler(`api-test-prefix`)

      expect(handlerCode).toContain(`name: 'Gatsby /prefix/api/test'`)
      expect(handlerCode).toContain(`path: '/prefix/api/test'`)
    })

    it.each([
      [`param`, `/api/param/[slug]`, `/api/param/:slug`],
      [`wildcard`, `/api/wildcard/[...]`, `/api/wildcard/*`],
      [
        `named-wildcard`,
        `/api/named-wildcard/[...slug]`,
        `/api/named-wildcard/:slug*`,
      ],
    ])(
      `converts bracketed route %s to the Netlify path %s`,
      async (functionId, name, netlifyPath) => {
        await prepareFunction(
          {
            functionId,
            name,
            pathToEntryPoint,
            requiredFiles: [requiredFile],
          },
          [netlifyPath],
          ``
        )

        const handlerCode = getWrittenHandler(functionId)
        expect(handlerCode).toContain(`path: '${netlifyPath}',`)
      }
    )
  })
})

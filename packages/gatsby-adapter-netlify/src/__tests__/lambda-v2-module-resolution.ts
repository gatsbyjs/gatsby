import {
  ensureDirSync,
  ensureSymlinkSync,
  existsSync,
  mkdtempSync,
  outputFileSync,
  outputJSONSync,
  readFileSync,
  readJSONSync,
  removeSync,
} from "fs-extra"
import { join } from "node:path"
import { slash } from "gatsby-core-utils/path"
import { tmpdir } from "node:os"

import {
  collectNodeModuleFiles,
  ensureRuntimeResolvable,
  findNodeModuleDir,
  isExcludedDir,
  isExcludedFile,
} from "../lambda-v2"

describe(`isExcludedDir`, () => {
  it(`excludes __tests__ directories`, () => {
    expect(isExcludedDir(`__tests__`)).toBe(true)
  })

  it(`does not exclude other directories`, () => {
    expect(isExcludedDir(`lib`)).toBe(false)
  })
})

describe(`isExcludedFile`, () => {
  it.each([
    [`README.md`, true],
    [`readme.MD`, true],
    [`LICENSE`, true],
    [`license.txt`, true],
    [`LICENCE`, true],
    [`tsconfig.json`, true],
    [`gulpfile.js`, true],
    [`index.js`, false],
    [`package.json`, false],
  ])(`for %s returns %s`, (name, expected) => {
    expect(isExcludedFile(name)).toBe(expected)
  })
})

describe(`node_modules resolution`, () => {
  let root: string
  let cwdSpy: jest.SpyInstance<string, []>

  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), `lambda-v2-resolution-`))
    cwdSpy = jest.spyOn(process, `cwd`).mockReturnValue(root)
  })

  afterEach(() => {
    cwdSpy.mockRestore()
    removeSync(root)
  })

  function writePackage(
    relativeDir: string,
    pkg: Record<string, unknown>,
    extraFiles: Record<string, string> = {}
  ): void {
    const dir = join(root, relativeDir)
    outputJSONSync(join(dir, `package.json`), pkg)

    for (const [file, content] of Object.entries(extraFiles)) {
      outputFileSync(join(dir, file), content)
    }
  }

  describe(`findNodeModuleDir`, () => {
    it(`finds a package hoisted directly under cwd()'s node_modules`, () => {
      writePackage(`node_modules/foo`, { name: `foo` })

      expect(findNodeModuleDir(`foo`)).toBe(join(root, `node_modules`, `foo`))
    })

    it(`prefers the adapter's own nested node_modules over the hoisted one`, () => {
      writePackage(`node_modules/gatsby-adapter-netlify/node_modules/foo`, {
        name: `foo-nested`,
      })

      writePackage(`node_modules/foo`, {
        name: `foo-hoisted`,
      })

      expect(findNodeModuleDir(`foo`)).toBe(
        join(
          root,
          `node_modules`,
          `gatsby-adapter-netlify`,
          `node_modules`,
          `foo`
        )
      )
    })

    it(`walks up parent directories to find a hoisted monorepo dependency`, () => {
      writePackage(`node_modules/foo`, { name: `foo` })
      const projectDir = join(root, `packages`, `site`)
      ensureDirSync(projectDir)
      cwdSpy.mockReturnValue(projectDir)

      expect(findNodeModuleDir(`foo`)).toBe(join(root, `node_modules`, `foo`))
    })

    it(`falls back to the pnpm virtual store via the adapter's sibling layout`, () => {
      const pnpmModules = join(
        root,
        `node_modules`,
        `.pnpm`,
        `gatsby-adapter-netlify@1.0.0`,
        `node_modules`
      )

      outputJSONSync(
        join(pnpmModules, `gatsby-adapter-netlify`, `package.json`),
        {
          name: `gatsby-adapter-netlify`,
        }
      )

      outputJSONSync(join(pnpmModules, `cookie`, `package.json`), {
        name: `cookie`,
      })

      ensureSymlinkSync(
        join(pnpmModules, `gatsby-adapter-netlify`),
        join(root, `node_modules`, `gatsby-adapter-netlify`),
        `dir`
      )

      const dir = findNodeModuleDir(`cookie`)
      expect(dir).toBeDefined()

      expect(readJSONSync(join(dir as string, `package.json`)).name).toBe(
        `cookie`
      )
    })

    it(`falls back to the pnpm virtual store via gatsby's sibling layout`, () => {
      const pnpmModules = join(
        root,
        `node_modules`,
        `.pnpm`,
        `gatsby@1.0.0`,
        `node_modules`
      )

      outputJSONSync(join(pnpmModules, `gatsby`, `package.json`), {
        name: `gatsby`,
      })

      outputJSONSync(join(pnpmModules, `fs-extra`, `package.json`), {
        name: `fs-extra`,
      })

      ensureSymlinkSync(
        join(pnpmModules, `gatsby`),
        join(root, `node_modules`, `gatsby`),
        `dir`
      )

      const dir = findNodeModuleDir(`fs-extra`)
      expect(dir).toBeDefined()

      expect(readJSONSync(join(dir as string, `package.json`)).name).toBe(
        `fs-extra`
      )
    })

    it(`returns undefined for an optional package that cannot be found`, () => {
      expect(findNodeModuleDir(`does-not-exist`, true)).toBeUndefined()
    })

    it(`throws for a required package that cannot be found`, () => {
      expect(() => findNodeModuleDir(`does-not-exist`)).toThrow(
        /does-not-exist/
      )
    })
  })

  describe(`ensureRuntimeResolvable`, () => {
    it(`returns the same directory when it isn't inside a pnpm virtual store`, () => {
      const dir = join(root, `node_modules`, `cookie`)
      ensureDirSync(dir)
      expect(ensureRuntimeResolvable(dir, `cookie`)).toBe(dir)
    })

    it(`copies a virtual-store package into .cache/page-ssr/node_modules so it's resolvable at runtime`, () => {
      const virtualDir = join(
        root,
        `node_modules`,
        `.pnpm`,
        `cookie@1.0.0`,
        `node_modules`,
        `cookie`
      )

      outputFileSync(join(virtualDir, `index.js`), `module.exports = {}`)
      const result = ensureRuntimeResolvable(virtualDir, `cookie`)

      expect(result).toBe(
        join(root, `.cache`, `page-ssr`, `node_modules`, `cookie`)
      )

      expect(existsSync(join(result, `index.js`))).toBe(true)
    })

    it(`does not re-copy when the runtime-resolvable copy already exists`, () => {
      const virtualDir = join(
        root,
        `node_modules`,
        `.pnpm`,
        `cookie@1.0.0`,
        `node_modules`,
        `cookie`
      )

      outputFileSync(
        join(virtualDir, `index.js`),
        `module.exports = { version: 2 }`
      )

      const copyTarget = join(
        root,
        `.cache`,
        `page-ssr`,
        `node_modules`,
        `cookie`
      )

      outputFileSync(
        join(copyTarget, `index.js`),
        `module.exports = { version: 1 }`
      )

      const result = ensureRuntimeResolvable(virtualDir, `cookie`)

      expect(result).toBe(copyTarget)

      expect(readFileSync(join(result, `index.js`), `utf8`)).toContain(
        `version: 1`
      )
    })
  })

  describe(`collectNodeModuleFiles`, () => {
    it(`collects files recursively while excluding __tests__ dirs and doc/config files`, () => {
      writePackage(
        `node_modules/foo`,
        {
          name: `foo`,
        },
        {
          "index.js": `module.exports = {}`,
          "README.md": `# foo`,
          LICENSE: `MIT`,
          "tsconfig.json": `{}`,
          "lib/util.js": `module.exports = () => {}`,
          "__tests__/util.test.js": `test('x', () => {})`,
        }
      )

      const files = collectNodeModuleFiles(`foo`)

      expect(files).toEqual(
        expect.arrayContaining(
          [
            join(root, `node_modules`, `foo`, `package.json`),
            join(root, `node_modules`, `foo`, `index.js`),
            join(root, `node_modules`, `foo`, `lib`, `util.js`),
          ].map(slash)
        )
      )

      expect(files.some(f => f.includes(`__tests__`))).toBe(false)
      expect(files.some(f => f.endsWith(`README.md`))).toBe(false)
      expect(files.some(f => f.endsWith(`LICENSE`))).toBe(false)
      expect(files.some(f => f.endsWith(`tsconfig.json`))).toBe(false)
    })

    it(`recurses into transitive dependencies listed in package.json`, () => {
      writePackage(
        `node_modules/foo`,
        {
          dependencies: {
            bar: `^1.0.0`,
          },
          name: `foo`,
        },
        {
          "index.js": `require('bar')`,
        }
      )

      writePackage(
        `node_modules/bar`,
        {
          name: `bar`,
        },
        {
          "index.js": `module.exports = {}`,
        }
      )

      const files = collectNodeModuleFiles(`foo`)

      expect(files).toEqual(
        expect.arrayContaining([
          slash(join(root, `node_modules`, `bar`, `index.js`)),
        ])
      )
    })

    it(`dedupes a shared dependency across sibling calls via a shared visited set`, () => {
      writePackage(`node_modules/a`, {
        name: `a`,
        dependencies: {
          shared: `^1.0.0`,
        },
      })

      writePackage(`node_modules/b`, {
        name: `b`,
        dependencies: {
          shared: `^1.0.0`,
        },
      })

      writePackage(
        `node_modules/shared`,
        {
          name: `shared`,
        },
        {
          "index.js": `module.exports = {}`,
        }
      )

      const visited = new Set<string>()
      const filesA = collectNodeModuleFiles(`a`, false, visited)
      const filesB = collectNodeModuleFiles(`b`, false, visited)

      const sharedIndexPath = slash(
        join(root, `node_modules`, `shared`, `index.js`)
      )

      expect(filesA).toEqual(expect.arrayContaining([sharedIndexPath]))
      expect(filesB).not.toEqual(expect.arrayContaining([sharedIndexPath]))
    })

    it(`returns an empty array for an optional package that cannot be found`, () => {
      expect(collectNodeModuleFiles(`does-not-exist`, true)).toEqual([])
    })

    it(`throws for a required package that cannot be found`, () => {
      expect(() => collectNodeModuleFiles(`does-not-exist`)).toThrow(
        /does-not-exist/
      )
    })
  })
})

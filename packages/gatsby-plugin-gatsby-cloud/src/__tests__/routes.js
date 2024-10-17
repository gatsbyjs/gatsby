import * as fs from "fs-extra"
import * as path from "path"
import * as os from "os"
const { onPostBuild } = require(`../gatsby-node`)

describe(`Routes IPC`, () => {
  let tmpDir

  const pages = new Map()

  pages.set(`/`, { mode: `DSG`, path: `/` })
  pages.set(`/path/1/`, { mode: `DSG`, path: `/path/1` })
  pages.set(`/path/2/`, { mode: `SSR`, path: `/path/2` })
  pages.set(`/path/3/`, { mode: `SSG`, path: `/path/3` })
  pages.set(`/path/4/`, {
    mode: `SSR`,
    path: `/path/[id].js`,
    matchPath: `/path/:id`,
  })
  pages.set(`/path/5/`, {
    mode: `SSR`,
    path: `/path/[...].js`,
    matchPath: `/path/*`,
  })

  const getMockedState = () => {
    return {
      pages,
      program: {
        directory: tmpDir,
      },
      redirects: [],
      components: new Map([
        [
          1,
          {
            componentChunkName: `component---node-modules-gatsby-plugin-offline-app-shell-js`,
          },
        ],
        [
          2,
          {
            componentChunkName: `component---src-templates-blog-post-js`,
          },
        ],
        [
          3,
          {
            componentChunkName: `component---src-templates-post-js`,
          },
        ],
      ]),
      config: {
        assetPath: ``,
        pathPrefix: ``,
      },
    }
  }

  beforeAll(async () => {
    tmpDir = await fs.mkdtemp(
      path.join(os.tmpdir(), `gatsby-plugin-gatsby-cloud-item-dir`)
    )
    fs.mkdirSync(path.join(tmpDir, `public`))
    fs.writeJsonSync(path.join(tmpDir, `public`, `webpack.stats.json`), {})
    fs.mkdirSync(path.join(tmpDir, `.cache`))
    fs.writeJsonSync(path.join(tmpDir, `.cache`, `match-paths.json`), [])
  })

  it(`Emits pages with mode`, () => {
    process.send = jest.fn()

    onPostBuild(
      {
        store: {
          getState() {
            return getMockedState()
          },
        },
      },
      {}
    )

    if (os.platform() !== `win32`) {
      expect(process.send).toHaveBeenCalledWith(
        {
          type: `LOG_ACTION`,
          action: {
            type: `CREATE_ROUTE`,
            payload: {
              routes: {
                "index.html": `DSG`,
                "page-data/index/page-data.json": `DSG`,
                "path/1/index.html": `DSG`,
                "page-data/path/1/page-data.json": `DSG`,
                "path/2/index.html": `SSR`,
                "page-data/path/2/page-data.json": `SSR`,
                "page-data/path/*/page-data.json": `SSR`,
                "page-data/path/:id/page-data.json": `SSR`,
                "path/*/index.html": `SSR`,
                "path/:id/index.html": `SSR`,
              },
            },
          },
        },
        expect.any(Function)
      )

      expect(process.send).not.toHaveBeenCalledWith(
        {
          type: `LOG_ACTION`,
          action: {
            type: `CREATE_ROUTE`,
            payload: {
              routes: {
                "path/3/index.html": `SSG`,
                "page-data/path/3/page-data.json": `SSG`,
              },
            },
          },
        },
        expect.any(Function)
      )
    }

    if (os.platform() === `win32`) {
      expect(process.send).toHaveBeenCalledWith(
        {
          type: `LOG_ACTION`,
          action: {
            type: `CREATE_ROUTE`,
            payload: {
              routes: {
                "index.html": `DSG`,
                "page-data\\index\\page-data.json": `DSG`,
                "path\\1\\index.html": `DSG`,
                "page-data\\path\\1\\page-data.json": `DSG`,
                "path\\2\\index.html": `SSR`,
                "page-data\\path\\2\\page-data.json": `SSR`,
                "path\\:id\\index.html": `SSR`,
                "page-data\\path\\:id\\page-data.json": `SSR`,
                "path\\*\\index.html": `SSR`,
                "page-data\\path\\*\\page-data.json": `SSR`,
              },
            },
          },
        },
        expect.any(Function)
      )

      expect(process.send).not.toHaveBeenCalledWith(
        {
          type: `LOG_ACTION`,
          action: {
            type: `CREATE_ROUTE`,
            payload: {
              routes: {
                "path\\3\\index.html": `SSG`,
                "page-data\\path\\3\\page-data.json": `SSG`,
              },
            },
          },
        },
        expect.any(Function)
      )
    }
  })

  it(`Emits totalPageCount`, async () => {
    const originalSend = process.send
    process.send = jest.fn()

    await onPostBuild(
      {
        store: {
          getState() {
            return getMockedState()
          },
        },
      },
      {}
    )

    expect(process.send).toHaveBeenCalledWith(
      {
        type: `LOG_ACTION`,
        action: {
          type: `CREATE_TOTAL_RENDERED_PAGE_COUNT`,
          payload: {
            totalRenderedPageCount: 6,
          },
        },
      },
      expect.anything()
    )

    process.send = originalSend
  })
})

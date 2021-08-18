import * as fs from "fs-extra"
import * as path from "path"
import * as os from "os"
const { onPostBuild } = require(`../gatsby-node`)

describe(`Routes IPC`, () => {
  let tmpDir
  beforeAll(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), `item-dir`))
    fs.mkdirSync(path.join(tmpDir, `public`))
    fs.writeJsonSync(path.join(tmpDir, `public`, `webpack.stats.json`), {})
    fs.mkdirSync(path.join(tmpDir, `.cache`))
    fs.writeJsonSync(path.join(tmpDir, `.cache`, `match-paths.json`), [])
  })

  it(`Emits pages with mode`, () => {
    process.send = jest.fn()

    const pages = new Map()

    pages.set(`/path/1/`, { mode: `DSR`, path: `/path/1` })
    pages.set(`/path/2/`, { mode: `SSR`, path: `/path/2` })
    pages.set(`/path/3/`, { mode: `SSG`, path: `/path/3` })

    onPostBuild(
      {
        pathPrefix: ``,
        store: {
          getState() {
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
              ]),
            }
          },
        },
      },
      {}
    )

    expect(process.send).toHaveBeenCalledWith({
      type: `LOG_ACTION`,
      action: {
        type: `LOG_ROUTES`,
        payload: {
          routes: {
            "path/1/index.html": `DSR`,
            "page-data/path/1/page-data.json": `DSR`,
          },
        },
      },
    })

    expect(process.send).toHaveBeenCalledWith({
      type: `LOG_ACTION`,
      action: {
        type: `LOG_ROUTES`,
        payload: {
          routes: {
            "path/2/index.html": `SSR`,
            "page-data/path/2/page-data.json": `SSR`,
          },
        },
      },
    })

    expect(process.send).not.toHaveBeenCalledWith({
      type: `LOG_ACTION`,
      action: {
        type: `LOG_ROUTES`,
        payload: {
          routes: {
            "path/3/index.html": `SSG`,
            "page-data/path/3/page-data.json": `SSG`,
          },
        },
      },
    })
  })
})

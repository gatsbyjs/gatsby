import fs from "fs-extra"
import childProcess from "child_process"
import systemPath from "path"

const apiPath = systemPath.join(__dirname, "../../apis.json")

it("generates the expected api output", done => {
  childProcess.exec("node ../output-api-file.js", async () => {
    const json = await fs.readJSON(apiPath)

    expect(json).toMatchInlineSnapshot(`
      Object {
        "browser": Object {
          "disableCorePrefetching": Object {},
          "onClientEntry": Object {},
          "onInitialClientRender": Object {},
          "onPostPrefetchPathname": Object {},
          "onPreRouteUpdate": Object {},
          "onPrefetchPathname": Object {},
          "onRouteUpdate": Object {},
          "onRouteUpdateDelayed": Object {},
          "onServiceWorkerActive": Object {},
          "onServiceWorkerInstalled": Object {},
          "onServiceWorkerRedundant": Object {},
          "onServiceWorkerUpdateFound": Object {},
          "onServiceWorkerUpdateReady": Object {},
          "registerServiceWorker": Object {},
          "replaceHydrateFunction": Object {},
          "shouldUpdateScroll": Object {},
          "wrapPageElement": Object {},
          "wrapRootElement": Object {},
        },
        "features": Array [
          "image-cdn",
          "graphql-typegen",
          "content-file-path",
          "slices",
          "stateful-source-nodes",
          "adapters",
        ],
        "node": Object {
          "createPages": Object {},
          "createPagesStatefully": Object {},
          "createResolvers": Object {
            "version": "2.2.0",
          },
          "createSchemaCustomization": Object {
            "version": "2.12.0",
          },
          "onCreateBabelConfig": Object {},
          "onCreateDevServer": Object {},
          "onCreateNode": Object {},
          "onCreatePage": Object {},
          "onCreateWebpackConfig": Object {},
          "onPluginInit": Object {
            "version": "3.9.0",
          },
          "onPostBootstrap": Object {},
          "onPostBuild": Object {},
          "onPreBootstrap": Object {},
          "onPreBuild": Object {},
          "onPreExtractQueries": Object {},
          "onPreInit": Object {},
          "pluginOptionsSchema": Object {
            "version": "2.25.0",
          },
          "preprocessSource": Object {},
          "resolvableExtensions": Object {},
          "setFieldsOnGraphQLNodeType": Object {},
          "shouldOnCreateNode": Object {
            "version": "5.0.0",
          },
          "sourceNodes": Object {},
        },
        "ssr": Object {
          "onPreRenderHTML": Object {},
          "onRenderBody": Object {},
          "replaceRenderer": Object {},
          "wrapPageElement": Object {},
          "wrapRootElement": Object {},
        },
      }
    `)
    done()
  })
})

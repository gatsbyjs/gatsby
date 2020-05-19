import fs from "fs-extra"
import childProcess from "child_process"
import systemPath from "path"

const apiPath = systemPath.join(__dirname, "../../apis.json")

it("generates the expected api output", done => {
  childProcess.exec("node ../output-api-file.js", async () => {
    const json = await fs.readJSON(apiPath)

    expect(json).toMatchInlineSnapshot(`
      Object {
        "browser": Object {},
        "node": Object {},
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

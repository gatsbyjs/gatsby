import { validatePathQuery } from "../validate-path-query"
import systemPath from "path"
import fs from "fs-extra"

describe(`validatePathQuery`, () => {
  it(`throws on missing starting /`, () => {
    expect(() => {
      validatePathQuery(`foo/{bar}`, [])
    }).toThrowErrorMatchingInlineSnapshot(`
"PageCreator: To query node \\"gatsbyPath\\" the \\"filePath\\" argument must be an absolute path, starting with a /
Please change this to: \\"/foo/{bar}\\""
`)
  })

  it(`throws error if you include the extension`, () => {
    expect(() => {
      validatePathQuery(`/foo/{bar}.js`, [])
    }).toThrowErrorMatchingInlineSnapshot(`
"PageCreator: To query node \\"gatsbyPath\\" the \\"filePath\\" argument must omit the file extension
Please change /foo/{bar}.js to \\"/foo/{bar}\\""
`)
  })

  it(`throws error if you include src/pages`, () => {
    expect(() => {
      validatePathQuery(`/src/pages/foo/{bar}`, [])
    }).toThrowErrorMatchingInlineSnapshot(`
"PageCreator: To query node \\"gatsbyPath\\" the \\"filePath\\" argument must omit the src/pages prefix.
Please change this to: \\"foo/{bar}\\""
`)
  })

  it(`throws error if you include index`, () => {
    expect(() => {
      validatePathQuery(`/foo/{bar}/index`, [])
    }).toThrowErrorMatchingInlineSnapshot(`
"PageCreator: To query node \\"gatsbyPath\\" the \\"filePath\\" argument must omit index.
Please change this to: \\"/foo/{bar}/\\""
`)
  })

  it(`throws error if the file does not exist`, () => {
    expect(() => {
      validatePathQuery(`/foo/{bar}`, [`.js`, `.ts`, `.mjs`])
    }).toThrowErrorMatchingInlineSnapshot(`
"PageCreator: To query node \\"gatsbyPath\\" the \\"filePath\\" argument must represent a file that exists.
Unable to find a file at: \\"<PROJECT_ROOT>/src/pages/foo/{bar}\\""
`)
  })

  it(`works if all the above predicates pass`, async () => {
    const filePath = `/baz/{bar}`
    const absolutePath = systemPath.join(
      process.cwd(),
      `src/pages`,
      `${filePath}.js`
    )
    await fs.createFile(absolutePath)

    expect(() => {
      validatePathQuery(filePath, [`.js`, `.ts`, `.mjs`])
    }).not.toThrow()

    await fs.remove(systemPath.join(process.cwd(), `src/pages`))
  })
})

import * as path from "path"
import { listPlugins } from "../list-plugins"

describe(`list-plugins`, () => {
  it(`works for strings and objects with "resolve"`, async () => {
    const root = path.join(__dirname, `./fixtures`)

    const list = listPlugins({ root })
    expect(list).toEqual([`gatsby-transformer-remark`, `gatsby-plugin-mdx`])
  })
})

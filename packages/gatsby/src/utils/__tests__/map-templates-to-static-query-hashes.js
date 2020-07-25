import path from "path"
import { slash } from "gatsby-core-utils"
import mapTemplatesToStaticQueryHashes from "../map-templates-to-static-query-hashes"

const page1 = slash(`${process.cwd()}/src/pages/index.js`)
const page2 = slash(`${process.cwd()}/src/pages/pages-2.js`)
const components = new Map()
components.set(page1, {
  componentPath: page1,
  query: ``,
  pages: new Set([`/`]),
})

components.set(page2, {
  componentPath: page2,
  query: ``,
  pages: new Set([`/`]),
})

const staticQueryComponents = new Map()
staticQueryComponents.set(`sq--src-components-image-js`, {
  id: `sq--src-components-image-js`,
  componentPath: slash(`${process.cwd()}/src/components/image.js`),
  query: `query { placeholderImage: file(relativePath: {eq: "gatsby-astronaut.png"}) { public { publicUrl } } }`,
  hash: 1,
})
staticQueryComponents.set(`sq--src-components-seo-js`, {
  id: `sq--src-components-seo-js`,
  componentPath: slash(`${process.cwd()}/src/components/seo.js`),
  query: `query { site { siteMetadata { title } } }`,
  hash: 2,
})

const createModule = (resource, reasons = []) => {
  return {
    hasReasons: () => !!reasons.length,
    identifier: () => resource,
    resource: path.join(process.cwd(), resource),
    reasons: reasons.map(r => {
      return {
        module: r,
      }
    }),
  }
}

describe(`map-templates-to-static-query-hashes`, () => {
  it(`should map static-queries to a component file on all platforms`, () => {
    const asyncRequires = createModule(
      `_this_is_virtual_fs_path_/$virtual/async-requires.js`
    )

    const templateMap = mapTemplatesToStaticQueryHashes(
      {
        components,
        staticQueryComponents,
      },
      {
        modules: [
          createModule(`src/components/layout.js`, [
            createModule(`src/pages/index.js`, [asyncRequires]),
            createModule(`src/pages/pages-2.js`, [asyncRequires]),
          ]),
          createModule(`src/components/image.js`, [
            createModule(`src/pages/index.js`, [asyncRequires]),
          ]),
          createModule(`src/components/seo.js`, [
            createModule(`src/pages/pages-2.js`, [asyncRequires]),
          ]),
        ],
      }
    )

    expect(templateMap.size).toBe(2)
    expect(templateMap.get(page1)).toEqual([`1`])
    expect(templateMap.get(page2)).toEqual([`2`])
  })
})

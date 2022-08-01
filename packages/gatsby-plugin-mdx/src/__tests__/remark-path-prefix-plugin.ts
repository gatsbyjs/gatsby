import { createProcessor } from "@mdx-js/mdx"

import { remarkPathPlugin } from "../remark-path-prefix-plugin"

describe(`remark: path prefix`, () => {
  it(`do not touch with empty prefix`, async () => {
    const processor = createProcessor({
      remarkPlugins: [
        [
          remarkPathPlugin,
          {
            pathPrefix: ``,
          },
        ],
      ],
    })

    const res = await processor.process(`[Some Link](/some-page/)`)

    expect(res.value).toContain(`href: "/some-page/"`)
  })

  it(`attach prefix`, async () => {
    const processor = createProcessor({
      remarkPlugins: [
        [
          remarkPathPlugin,
          {
            pathPrefix: `/some/prefix`,
          },
        ],
      ],
    })

    const res = await processor.process(`[Some Link](/some-page/)`)

    expect(res.value).toContain(`href: "/some/prefix/some-page/"`)
  })
})

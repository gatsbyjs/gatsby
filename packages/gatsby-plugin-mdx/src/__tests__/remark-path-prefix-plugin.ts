import remark from "remark"

import { remarkPathPlugin } from "../remark-path-prefix-plugin"

describe(`remark: path prefix`, () => {
  it(`do not touch with empty prefix`, async () => {
    const processor = remark().use(remarkPathPlugin, {
      pathPrefix: ``,
    })

    const res = await processor.process(`[Some Link](/some-page/)`)

    expect(res.contents).toBe(`[Some Link](/some-page/)\n`)
  })

  it(`attach prefix`, async () => {
    const processor = remark().use(remarkPathPlugin, {
      pathPrefix: `/some/prefix`,
    })

    const res = await processor.process(`[Some Link](/some-page/)`)

    expect(res.contents).toBe(`[Some Link](/some/prefix/some-page/)\n`)
  })
})

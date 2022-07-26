import { createNodeId } from "../create-node-id"

describe(`createNodeId`, (): void => {
  describe(`uuid`, () => {
    it(`should return a string`, () => {
      // Key is just something random that's not only ascii
      const id2 = createNodeId(`myboea"`, `ghost ns`)

      expect(typeof id2).toBe(`string`)
    })

    it(`should return a different hash for different keys`, () => {
      const id1 = createNodeId(`my things`, `gatsby-some-plugin`)
      const id2 = createNodeId(`your things`, `gatsby-some-plugin`)

      expect(id1 !== id2).toBe(true)

      // For completion sake
      expect(id1).toMatchInlineSnapshot(
        `"1ddac06a-6a4d-5921-a898-e9473e7ff0b1"`
      )
      expect(id2).toMatchInlineSnapshot(
        `"b5a21b9c-ff21-5d05-9c7d-8d86c69d5399"`
      )
    })

    it(`should return a different hash for different namespaces`, () => {
      const id1 = createNodeId(`my things`, `gatsby-special-plugin`)
      const id2 = createNodeId(`my things`, `gatsby-other-plugin`)

      expect(id1 !== id2).toBe(true)

      // For completion sake
      expect(id1).toMatchInlineSnapshot(
        `"03ca507d-c732-5412-95d2-eaf114f42f69"`
      )
      expect(id2).toMatchInlineSnapshot(
        `"5db58b36-473b-5c3f-a676-db34af789baf"`
      )
    })

    it(`return same id for same input`, () => {
      const KEY = `resolved "https://registry.yarnpkg.com/cuint/-/cuint-0.2.2.tgz#408086d409550c2631155619e9fa7bc"`
      const NS = `gatsby-special-plugin`
      // Key is just something random that's not only ascii
      const id = createNodeId(KEY, NS)

      // Only input should affect it so repetitive calls should not change the output
      expect(id).toMatchInlineSnapshot(`"6614d1bf-8c8c-5cfc-b782-2c019d7a7c95"`)

      for (let i = 0; i < 10; ++i) {
        const id2 = createNodeId(KEY, NS)

        expect(id2).toEqual(id)
      }
    })
  })
})

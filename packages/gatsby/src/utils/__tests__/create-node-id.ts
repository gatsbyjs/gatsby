import { createNodeId } from "../create-node-id"

describe(`createNodeId`, (): void => {
  describe(`uuid`, () => {
    // Keep tests in this group in sync with the xxhash group below

    it(`should hash a value without namespace`, () => {
      // Key is just something random that's not only ascii
      const id = createNodeId(
        `resolved "https://registry.yarnpkg.com/cuint/-/cuint-0.2.2.tgz#408086d409550c2631155619e9fa7bcadc3b991b"`
      )

      // The id should be consistent and deterministic (input should affect output, not run instance or rng)
      expect(id).toMatchInlineSnapshot(`"ff299ec2-7698-599e-89ef-02f9a9a424c7"`)
    })

    it(`should hash a value with a namespace`, () => {
      // Key is just something random that's not only ascii
      const idSans = createNodeId(
        `resolved "https://registry.yarnpkg.com/cuint/-/cuint-0.2.2.tgz#408086d409550c2631155619e9fa7bcadc3b991b"`
      )
      const idWith = createNodeId(
        `resolved "https://registry.yarnpkg.com/cuint/-/cuint-0.2.2.tgz#408086d409550c2631155619e9fa7bcadc3b991b"`,
        `gatsby-special-plugin`
      )

      // The id should be consistent and deterministic (input should affect output, not run instance or rng)
      expect(idSans !== idWith).toEqual(true)
    })

    it(`should return a string`, () => {
      // Key is just something random that's not only ascii
      const id = createNodeId(`myboea"`)

      expect(typeof id).toBe(`string`)

      const id2 = createNodeId(`myboea"`, `ghost ns`)

      expect(typeof id2).toBe(`string`)
    })

    it(`should return a different hash for namespaces`, () => {
      const idSans = createNodeId(`my things`)
      const id1 = createNodeId(`my things`, `gatsby-special-plugin`)
      const id2 = createNodeId(`my things`, `gatsby-other-plugin`)

      expect(idSans !== id1).toBe(true)
      expect(idSans !== id2).toBe(true)
      expect(id1 !== id2).toBe(true)

      // For completion sake
      expect(idSans).toMatchInlineSnapshot(
        `"abfbea78-3ad4-57b7-9db8-2f43e9efe786"`
      )
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
      const idSans = createNodeId(KEY)
      const idWith = createNodeId(KEY, NS)

      // Only input should affect it so repetitive calls should not change the output
      expect(idSans).toMatchInlineSnapshot(
        `"826331ae-3f00-5556-9563-187da41e1c1c"`
      )
      expect(idWith).toMatchInlineSnapshot(
        `"6614d1bf-8c8c-5cfc-b782-2c019d7a7c95"`
      )

      for (let i = 0; i < 10; ++i) {
        const idSans2 = createNodeId(KEY)
        const idWith2 = createNodeId(KEY, NS)

        expect(idSans2).toEqual(idSans)
        expect(idWith2).toEqual(idWith)
      }
    })
  })

  describe(`xxhash`, () => {
    // This set is duplicate to the one above except it sets the env flag before and removes it afterwards
    // Keep in sync

    beforeEach(() => {
      process.env.GATSBY_EXPERIMENTAL_ID_XXHASH = `1`
    })

    afterEach(() => {
      delete process.env.GATSBY_EXPERIMENTAL_ID_XXHASH
    })

    it(`should hash a value without namespace`, () => {
      // Key is just something random that's not only ascii
      const id = createNodeId(
        `resolved "https://registry.yarnpkg.com/cuint/-/cuint-0.2.2.tgz#408086d409550c2631155619e9fa7bcadc3b991b"`
      )

      // The id should be consistent and deterministic (input should affect output, not run instance or rng)
      expect(id).toMatchInlineSnapshot(`"Ga4c1c7d4"`)
    })

    it(`should hash a value with a namespace`, () => {
      // Key is just something random that's not only ascii
      const idSans = createNodeId(
        `resolved "https://registry.yarnpkg.com/cuint/-/cuint-0.2.2.tgz#408086d409550c2631155619e9fa7bcadc3b991b"`
      )
      const idWith = createNodeId(
        `resolved "https://registry.yarnpkg.com/cuint/-/cuint-0.2.2.tgz#408086d409550c2631155619e9fa7bcadc3b991b"`,
        `gatsby-special-plugin`
      )

      // The id should be consistent and deterministic (input should affect output, not run instance or rng)
      expect(idSans !== idWith).toEqual(true)
    })

    it(`should return a string`, () => {
      // Key is just something random that's not only ascii
      const id = createNodeId(`myboea"`)

      expect(typeof id).toBe(`string`)

      const id2 = createNodeId(`myboea"`, `ghost ns`)

      expect(typeof id2).toBe(`string`)
    })

    it(`should return a different hash for namespaces`, () => {
      const idSans = createNodeId(`my things`)
      const id1 = createNodeId(`my things`, `gatsby-special-plugin`)
      const id2 = createNodeId(`my things`, `gatsby-other-plugin`)

      expect(idSans !== id1).toBe(true)
      expect(idSans !== id2).toBe(true)
      expect(id1 !== id2).toBe(true)

      // For completion sake
      expect(idSans).toMatchInlineSnapshot(`"G2546f2f0"`)
      expect(id1).toMatchInlineSnapshot(`"G2f0665fc2546f2f0"`)
      expect(id2).toMatchInlineSnapshot(`"G9ff818ec2546f2f0"`)
    })

    it(`return same id for same input`, () => {
      const KEY = `resolved "https://registry.yarnpkg.com/cuint/-/cuint-0.2.2.tgz#408086d409550c2631155619e9fa7bc"`
      const NS = `gatsby-special-plugin`
      // Key is just something random that's not only ascii
      const idSans = createNodeId(KEY)
      const idWith = createNodeId(KEY, NS)

      // Only input should affect it so repetitive calls should not change the output
      expect(idSans).toMatchInlineSnapshot(`"G92954a39"`)
      expect(idWith).toMatchInlineSnapshot(`"G2f0665fc92954a39"`)

      for (let i = 0; i < 10; ++i) {
        const idSans2 = createNodeId(KEY)
        const idWith2 = createNodeId(KEY, NS)

        expect(idSans2).toEqual(idSans)
        expect(idWith2).toEqual(idWith)
      }
    })
  })
})

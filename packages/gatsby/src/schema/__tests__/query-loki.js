const queryLoki = require(`../query-loki`)

describe(`query-loki`, () => {
  describe(`convertArgs`, () => {
    it(`simple filter`, async () => {
      const gqlArgs = {
        filter: {
          id: {
            eq: "1",
          },
        },
      }
      const expectedArgs = {
        id: {
          $eq: "1",
        },
      }
      const result = queryLoki.convertArgs(gqlArgs)
      expect(result).toEqual(expectedArgs)
    })

    it(`nested field`, async () => {
      const gqlArgs = {
        filter: {
          fields: {
            slug: {
              eq: "1",
            },
          },
        },
      }
      const expectedArgs = {
        "fields.slug": {
          $eq: "1",
        },
      }
      const result = queryLoki.convertArgs(gqlArgs)
      expect(result).toEqual(expectedArgs)
    })

    it(`nested fields`, async () => {
      const gqlArgs = {
        filter: {
          fields: {
            slug: {
              eq: "1",
            },
            bar: {
              eq: "2",
            },
          },
        },
      }
      const expectedArgs = {
        "fields.slug": {
          $eq: "1",
        },
        "fields.bar": {
          $eq: "2",
        },
      }
      const result = queryLoki.convertArgs(gqlArgs)
      expect(result).toEqual(expectedArgs)
    })

    it(`nested and simple fields`, async () => {
      const gqlArgs = {
        filter: {
          fields: {
            slug: {
              eq: "1",
            },
            bar: {
              eq: "2",
            },
          },
          id: {
            eq: "3",
          },
        },
      }
      const expectedArgs = {
        "fields.slug": {
          $eq: "1",
        },
        "fields.bar": {
          $eq: "2",
        },
        id: {
          $eq: "3",
        },
      }
      const result = queryLoki.convertArgs(gqlArgs)
      expect(result).toEqual(expectedArgs)
    })
  })
})

const queryLoki = require(`../query-loki`)
const loki = require(`lokijs`)
const db = new loki(`loki-test.json`)
const dbModule = require(`../../db`)

jest.mock(`../../db`)

describe(`query-loki`, () => {
  describe(`convertArgs`, () => {
    it(`simple filter`, async () => {
      const gqlArgs = {
        filter: {
          id: {
            eq: `1`,
          },
        },
      }
      const expectedArgs = {
        id: {
          $eq: `1`,
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
              eq: `1`,
            },
          },
        },
      }
      const expectedArgs = {
        "fields.slug": {
          $eq: `1`,
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
              eq: `1`,
            },
            bar: {
              eq: `2`,
            },
          },
        },
      }
      const expectedArgs = {
        "fields.slug": {
          $eq: `1`,
        },
        "fields.bar": {
          $eq: `2`,
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
              eq: `1`,
            },
            bar: {
              eq: `2`,
            },
          },
          id: {
            eq: `3`,
          },
        },
      }
      const expectedArgs = {
        "fields.slug": {
          $eq: `1`,
        },
        "fields.bar": {
          $eq: `2`,
        },
        id: {
          $eq: `3`,
        },
      }
      const result = queryLoki.convertArgs(gqlArgs)
      expect(result).toEqual(expectedArgs)
    })
  })

  describe(`queries`, () => {
    it(`regex`, async () => {
      dbModule.getDb.mockReturnValue(db)

      const typeName = `testType`
      const gqlType = { name: typeName }
      const node = {
        id: `0`,
        foo: `src/foobar.js`,
      }

      const coll = db.addCollection(typeName)
      coll.insert(node)

      const rawGqlArgs = {
        filter: {
          foo: {
            regex: `/src.*bar.js/`,
          },
        },
      }

      const result = await queryLoki.runQuery({ gqlType, rawGqlArgs })

      expect(result).toHaveLength(1)
      expect(result[0]).toHaveProperty(`id`, `0`)
    })

    it(`nested sorting`, async () => {
      dbModule.getDb.mockReturnValue(db)

      const typeName = `NestedSorting`
      const gqlType = { name: typeName }
      const nodes = [
        {
          id: `0`,
          foo: { bar: `2017` },
        },
        {
          id: `1`,
          foo: { bar: `2016` },
        },
        {
          id: `2`,
          foo: { bar: `2018` },
        },
      ]

      const coll = db.addCollection(typeName)
      coll.insert(nodes)

      const rawGqlArgs = {
        sort: {
          order: `DESC`,
          fields: [`foo___bar`],
        },
      }

      const result = await queryLoki.runQuery({ gqlType, rawGqlArgs })

      expect(result).toHaveLength(3)
      expect(result[0]).toHaveProperty(`id`, `2`)
      expect(result[1]).toHaveProperty(`id`, `0`)
      expect(result[2]).toHaveProperty(`id`, `1`)
    })
  })
})

const { fetchGraphql } = require("./test-utils/graphql")

describe(`plugin options`, () => {
  test(`Type.exclude option removes types from the schema`, async () => {
    const result = await fetchGraphql({
      url: `http://localhost:8000/___graphql`,
      query: /* GraphQL */ `
        {
          __schema {
            types {
              name
            }
          }
        }
      `,
    })

    const excludedTypes = [
      `ActionMonitorAction`,
      `UserToActionMonitorActionConnection`,
      `Plugin`,
      `Theme`,
    ]

    // make sure our schema doesn't have any of the default excluded types
    // in gatsby-source-wordpress/src/models/gatsby-api
    excludedTypes.forEach(typeName => {
      expect(
        !!result.data.__schema.types.find(type => type.name === `Wp${typeName}`)
      ).toBe(false)
    })
  })

  test(`Type.excludeFieldNames removes fields from the schema on types by field names`, async () => {
    const excludeFieldsOnTypesGroups = [
      {
        typeName: `Page`,
        fieldNames: [`enclosure`],
      },
      {
        typeName: `User`,
        fieldNames: [`extraCapabilities`, `capKey`, `email`, `registeredDate`],
      },
    ]

    const query = `
        {
          ${excludeFieldsOnTypesGroups
            .map(
              group => `
                ${group.typeName}: __type(name: "Wp${group.typeName}") {
                  fields {
                    name
                  }
                }
              `
            )
            .join(` `)}
        }
      `

    const result = await fetchGraphql({
      url: `http://localhost:8000/___graphql`,
      query,
    })

    // for all our test type names
    excludeFieldsOnTypesGroups.forEach(excludeGroup => {
      // get that type from the Gatsby schema
      const typeInSchema = result.data[excludeGroup.typeName]

      // for each excluded field on our type
      excludeGroup.fieldNames.forEach(fieldName => {
        // expect that the type in our Gatsby schema doesn't have a field
        // with this excluded name
        const fieldNameExistsOnType = !!typeInSchema.fields
          .map(field => field.name)
          .includes(fieldName)

        expect(fieldNameExistsOnType).toBe(false)
      })
    })
  })

  // @todo this setting is broken 😱
  // test(`excludeFieldNames option excludes fields from the schema globally`, async () => {
  //   const result = await fetchGraphql({
  //     url: `http://localhost:8000/___graphql`,
  //     query: /* GraphQL */ `
  //       {
  //         wpPage: __type(name: "WpPage") {
  //           fields {
  //             name
  //           }
  //         }

  //         wpPost: __type(name: "WpPost") {
  //           fields {
  //             name
  //           }
  //         }
  //       }
  //     `,
  //   })

  //   const commentFieldFinder = ({ name }) => name === `commentCount`

  //   const wpPageCommentCountField = result.data.wpPage.fields.find(
  //     commentFieldFinder
  //   )

  //   const wpPostCommentCountField = result.data.wpPost.fields.find(
  //     commentFieldFinder
  //   )

  //   expect(wpPostCommentCountField && wpPageCommentCountField).toBeFalsy()
  // })

  // test(`Type.where option works when set to filter for French posts`, async () => {
  //   const result = await fetchGraphql({
  //     url: `http://localhost:8000/___graphql`,
  //     query: /* GraphQL */ `
  //       {
  //         allWpTranslationFilterTest {
  //           totalCount
  //           nodes {
  //             title
  //           }
  //         }
  //       }
  //     `,
  //   })

  //   expect(result.data.allWpTranslationFilterTest.totalCount).toEqual(1)
  //   expect(result.data.allWpTranslationFilterTest.nodes[0].title).toEqual(
  //     `French page`
  //   )
  // })

  test(`Type.limit option works when set to 1`, async () => {
    const result = await fetchGraphql({
      url: `http://localhost:8000/___graphql`,
      query: /* GraphQL */ `
        {
          allWpTypeLimitTest {
            totalCount
          }
        }
      `,
    })

    expect(result.data.allWpTypeLimitTest.totalCount).toEqual(1)
  })

  test(`Type.limit option works when set to 0`, async () => {
    const result = await fetchGraphql({
      url: `http://localhost:8000/___graphql`,
      query: /* GraphQL */ `
        {
          allWpTypeLimit0Test {
            totalCount
          }
        }
      `,
    })

    expect(result.data.allWpTypeLimit0Test.totalCount).toEqual(0)
  })
})

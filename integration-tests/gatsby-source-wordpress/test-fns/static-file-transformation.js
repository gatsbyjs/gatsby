const {
  default: fetchGraphql,
} = require("gatsby-source-wordpress/dist/utils/fetch-graphql")

const url = `http://localhost:8000/___graphql`

describe(`Static file transformation`, () => {
  it(`Transforms file URL's in JSON node data`, async () => {
    const {
      data: { wpPage },
    } = await fetchGraphql({
      url,
      query: /* GraphQL */ `
        {
          wpPage(title: { eq: "Full url link replacer test" }) {
            acfPageFields {
              linkField {
                url
              }
            }
          }
        }
      `,
    })

    const fileUrl = wpPage.acfPageFields.linkField.url
    expect(fileUrl).not.toContain(`http://localhost:8001`)
    expect(fileUrl).toContain(`/static/`)
    expect(fileUrl).toContain(`file-sample_1MB.doc`)
  })
})

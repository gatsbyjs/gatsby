const {
  default: fetchGraphql,
} = require("gatsby-source-wordpress/dist/utils/fetch-graphql")

const execall = require("execall")

const countGatsbyImgs = string =>
  execall(/[^-]gatsby-image-wrapper[^-]/gim, string).length

describe(`Gatsby image processing`, () => {
  it(`transforms inline-html images properly`, async () => {
    const {
      data: { acfPage },
    } = await fetchGraphql({
      url: `http://localhost:8000/__graphql`,
      query: /* GraphQL */ `
        {
          acfPage: wpPage(databaseId: { eq: 7646 }) {
            acfPageFields {
              wysiwygEditorField
            }
          }
        }
      `,
    })
    expect(acfPage.acfPageFields.wysiwygEditorField).toBeTruthy()
    expect(countGatsbyImgs(acfPage.acfPageFields.wysiwygEditorField)).toBe(2)
  })
})

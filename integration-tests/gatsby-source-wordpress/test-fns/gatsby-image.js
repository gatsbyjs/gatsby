const { fetchGraphql } = require("./test-utils/graphql")

const execall = require("execall")

const countGatsbyImgs = string =>
  execall(/[^-]gatsby-image-wrapper[^-]/gim, string).length
const countGatsbyFiles = string =>
  execall(/[^-]_gatsby\/file[^-]/gim, string).length

describe(`Gatsby image processing`, () => {
  it(`transforms inline-html images properly`, async () => {
    const {
      data: { acfPage, inlineSvgImageInHtmlFieldPage },
    } = await fetchGraphql({
      url: `http://localhost:8000/__graphql`,
      query: /* GraphQL */ `
        {
          acfPage: wpPage(databaseId: { eq: 7646 }) {
            acfPageFields {
              wysiwygEditorField
            }
          }
          inlineSvgImageInHtmlFieldPage: wpPage(databaseId: { eq: 11847 }) {
            content
          }
        }
      `,
    })
    expect(acfPage.acfPageFields.wysiwygEditorField).toBeTruthy()
    expect(countGatsbyImgs(acfPage.acfPageFields.wysiwygEditorField)).toBe(2)

    expect(inlineSvgImageInHtmlFieldPage?.content).toBeTruthy()
    expect(countGatsbyFiles(inlineSvgImageInHtmlFieldPage?.content)).toBe(1)
  })
})

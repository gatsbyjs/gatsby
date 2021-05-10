import execall from "execall"

import {
  getImgSrcRemoteFileMatchesFromNodeString,
  getImgTagMatchesWithUrl,
  getWpLinkRegex,
  searchAndReplaceNodeStrings,
} from "../dist/steps/source-nodes/create-nodes/process-node"

const wpUrl = `wp.fakesite.com`

test(`HTML image transformation regex matches images`, async () => {
  const nodeString = `<img src=\\"https://${wpUrl}/wp-content/uploads/2020/01/©SDM-Yep-©Hi-000-Header.jpg\\" />

  <img src=\\"http://${wpUrl}/wp-content/uploads/2020/01/©SDM-Yep-©Hi-000-Header.jpg\\" />

  <img src=\\"/wp-content/uploads/2020/01/©SDM-Yep-©Hi-000-Header.jpg\\" />`

  const matches = getImgSrcRemoteFileMatchesFromNodeString(nodeString)

  expect(matches.length).toBe(3)

  const imgTagMatches = getImgTagMatchesWithUrl({
    nodeString,
    wpUrl: `https://${wpUrl}`,
  })

  expect(imgTagMatches.length).toBe(3)
})

test(`HTML link transformation regex matches links`, async () => {
  const nodeString = `<a href=\\"https://${wpUrl}/wp-content/uploads/2020/01/©SDM-Yep-©Hi-000-Header.jpg\\" />Not a transformable link</a>

  <a href=\\"https://other-site.com/hi\\" />Not a transformable link</a>

  <a href=\\"https://${wpUrl}/page-1\\">
    page 1
  </a>

  <a href=\\"https://${wpUrl}/\\">Home</a>`

  const wpLinkRegex = getWpLinkRegex(`https://${wpUrl}`)
  const matches = execall(wpLinkRegex, nodeString)

  expect(matches.length).toBe(2)
})

test(`Search and replace node strings using regex matches`, async () => {
  const nodeString = `Some stuff in a random string

  A new line with some stuff!

  We need to test some <a href=\\"https://old-site.com/hi\\" />link</a> as well!`

  const result = searchAndReplaceNodeStrings({
    nodeString,
    node: { __typename: `FakeTypeName`, id: `cG9zdDo0OQ==` },
    pluginOptions: {
      searchAndReplace: [
        { search: /(S|s)ome stuff/gm, replace: `some other thing` },
        { search: `https://old-site\.com`, replace: `https://new-site.com` },
      ]
    }
  })

  expect(result).toBe(`some other thing in a random string

  A new line with some other thing!

  We need to test some <a href=\\"https://new-site.com/hi\\" />link</a> as well!`)
})

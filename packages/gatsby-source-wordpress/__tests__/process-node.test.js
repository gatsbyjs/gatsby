import execall from "execall"

import {
  getImgSrcRemoteFileMatchesFromNodeString,
  getImgTagMatchesWithUrl,
  getWpLinkRegex,
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

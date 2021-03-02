import {
  getImgSrcRemoteFileMatchesFromNodeString,
  getImgTagMatchesWithUrl,
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

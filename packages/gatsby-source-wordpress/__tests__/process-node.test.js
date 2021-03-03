import {
  getImgSrcRemoteFileMatchesFromNodeString,
  getImgTagMatchesWithUrl,
} from "../dist/steps/source-nodes/create-nodes/process-node"

test(`HTML image transformation regex matches images`, async () => {
  const wpUrl = `http://wp.fakesite.com`

  const nodeString = `<img src=\\"https://wp.fakesite.com/wp-content/uploads/2020/01/©SDM-Yep-©Hi-000-Header.jpg />

  <img src=\\"http://wp.fakesite.com/wp-content/uploads/2020/01/©SDM-Yep-©Hi-000-Header.jpg />

  <img src=\\"/wp-content/uploads/2020/01/©SDM-Yep-©Hi-000-Header.jpg />`

  const matches = getImgSrcRemoteFileMatchesFromNodeString(nodeString)

  expect(matches.length).toBe(3)

  const imgTagMatches = getImgTagMatchesWithUrl({
    nodeString,
    wpUrl,
  })

  expect(imgTagMatches.length).toBe(3)
})

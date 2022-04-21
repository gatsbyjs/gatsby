import execall from "execall"

import { replaceNodeHtmlImages } from "../dist/steps/source-nodes/create-nodes/process-node"

import {
  getImgSrcRemoteFileMatchesFromNodeString,
  getImgTagMatches,
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

  const imgTagMatches = getImgTagMatches({
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
        { search: `https://old-site.com`, replace: `https://new-site.com` },
      ]
    }
  })

  expect(result).toBe(`some other thing in a random string

  A new line with some other thing!

  We need to test some <a href=\\"https://new-site.com/hi\\" />link</a> as well!`)
})

jest.mock(`../dist/steps/source-nodes/fetch-nodes/fetch-referenced-media-items.js`, () => {
  return {
    __esModule: true,
    ...jest.requireActual(`../dist/steps/source-nodes/fetch-nodes/fetch-referenced-media-items.js`),
    default: jest.fn(() => require(`./fixtures/media`).referencedMediaItems)
  }
})


test(`Gatsby Image service works in html fields via replaceNodeHtmlImages`, async () => {
  const node = {
    content: `\n<p>Welcome to WordPress. This is your first post. Edit or deleteit, then start writing!</p>\n\n\n\n<p></p>\n\n\n\n<figureclass="wp-block-image size-large"><img loading="lazy" width="1024" height="768" src="http://wpgatsby.local/wp-content/uploads/2022/02/sasha-set-GURzQwO8Li0-unsplash-1024x768.jpg" alt=""class="wp-image-115" srcset="http://wpgatsby.local/wp-content/uploads/2022/02/sasha-set-GURzQwO8Li0-unsplash-1024x768.jpg 1024w,http://wpgatsby.local/wp-content/uploads/2022/02/sasha-set-GURzQwO8Li0-unsplash-300x225.jpg 300w, http://wpgatsby.local/wp-content/uploads/2022/02/sasha-set-GURzQwO8Li0-unsplash-768x576.jpg 768w,http://wpgatsby.local/wp-content/uploads/2022/02/sasha-set-GURzQwO8Li0-unsplash-1536x1152.jpg 1536w, http://wpgatsby.local/wp-content/uploads/2022/02/sasha-set-GURzQwO8Li0-unsplash-2048x1536.jpg 2048w"sizes="(max-width: 1024px) 100vw, 1024px" /></figure>\n`,
    id: `cG9zdDox`,
    modifiedGmt: `2022-02-18T23:18:00`,
    __typename: `Post`
  }

  const gatsbyImageUrl = `/_gatsby/image`

  const nodeString = JSON.stringify(node)

  const updatedNodeString = await replaceNodeHtmlImages({
    nodeString,
    node,
    helpers: {
      reporter: console
    },
    wpUrl: `http://wpgatsby.local/`,
    pluginOptions: {
      html: {
        useGatsbyImage: true
      }
    }
  })

  expect(updatedNodeString).toInclude(gatsbyImageUrl)
  expect(updatedNodeString).not.toEqual(nodeString)

  const imageMatches = execall(/\/_gatsby\/image/gm, updatedNodeString)
  expect(imageMatches.length).toBe(15)


  const transformedNodeStringNoHtmlImages = await replaceNodeHtmlImages({
    nodeString,
    node,
    helpers: {
      reporter: console
    },
    wpUrl: `http://wpgatsby.local/`,
    pluginOptions: {
      html: {
        useGatsbyImage: false
      }
    }
  })

  expect(transformedNodeStringNoHtmlImages).toEqual(nodeString)

  const noImageMatches = execall(/\/_gatsby\/image/gm, transformedNodeStringNoHtmlImages)

  expect(noImageMatches.length).toBe(0)

  expect(transformedNodeStringNoHtmlImages).not.toInclude(gatsbyImageUrl)
})

jest.mock(`gatsby-plugin-sharp`, () => {
  return {
    fluid({ file, args }) {
      return Promise.resolve({
        aspectRatio: 0.75,
        presentationWidth: 300,
        originalImg: file.absolutePath,
        src: file.absolutePath,
        srcSet: `${file.absolutePath}, ${file.absolutePath}`,
        sizes: `(max-width: ${args.maxWidth}px) 100vw, ${args.maxWidth}px`,
        base64: `url('data:image/png;base64, iVBORw)`,
      })
    },
  }
})

const Remark = require(`remark`)
const queryString = require(`query-string`)

const plugin = require(`../`)

const remark = new Remark().data(`settings`, {
  commonmark: true,
  footnotes: true,
  pedantic: true,
})

const createNode = content => {
  const node = {
    id: 1234,
  }

  const markdownNode = {
    id: `${node.id} >>> MarkdownRemark`,
    children: [],
    parent: node.id,
    internal: {
      content,
      contentDigest: `some-hash`,
      type: `MarkdownRemark`,
    },
  }

  markdownNode.frontmatter = {
    title: ``, // always include a title
    parent: node.id,
  }

  return markdownNode
}

const createPluginOptions = (content, imagePaths = `/`) => {
  const dirName = `not-a-real-dir`
  return {
    files: [].concat(imagePaths).map(imagePath => {
      return {
        absolutePath: queryString.parseUrl(`${dirName}/${imagePath}`).url,
      }
    }),
    markdownNode: createNode(content),
    markdownAST: remark.parse(content),
    getNode: () => {
      return {
        dir: dirName,
      }
    },
  }
}

test(`it returns empty array when 0 images`, async () => {
  const content = `
# hello world

Look ma, no images
  `.trim()

  const result = await plugin(createPluginOptions(content))

  expect(result).toEqual([])
})

test(`it leaves non-relative images alone`, async () => {
  const imagePath = `https://google.com/images/an-image.jpeg`
  const content = `
![asdf](${imagePath})
  `.trim()

  const result = await plugin(createPluginOptions(content, imagePath))

  expect(result).toEqual([])
})

test(`it transforms images in markdown`, async () => {
  const imagePath = `images/my-image.jpeg`
  const content = `

![image](./${imagePath})
  `.trim()

  const nodes = await plugin(createPluginOptions(content, imagePath))

  expect(nodes.length).toBe(1)

  const node = nodes.pop()
  expect(node.type).toBe(`html`)
  expect(node.value).toMatchSnapshot()
  expect(node.value).not.toMatch(`<html>`)
})

test(`it transforms multiple images in markdown`, async () => {
  const imagePaths = [`images/my-image.jpeg`, `images/other-image.jpeg`]

  const content = `
![image 1](./${imagePaths[0]})
![image 2](./${imagePaths[1]})
  `.trim()

  const nodes = await plugin(createPluginOptions(content, imagePaths))

  expect(nodes.length).toBe(imagePaths.length)
})

test(`it transforms image references in markdown`, async () => {
  const imagePath = `images/my-image.jpeg`
  const content = `
[refImage1]: ./${imagePath} "Ref Image Title"
![alt text][refImage1]
  `.trim()

  const nodes = await plugin(createPluginOptions(content, imagePath))

  expect(nodes.length).toBe(1)

  const node = nodes.pop()
  expect(node.type).toBe(`html`)
  expect(node.value).toMatchSnapshot()
  expect(node.value).not.toMatch(`<html>`)
})

test(`it leaves orphan image references alone`, async () => {
  const imagePath = `images/my-image.jpeg`
  const content = `
[refImage1]: ./${imagePath} "Ref Image Title"
![image][refImage2]
  `.trim()

  const result = await plugin(createPluginOptions(content, imagePath))

  expect(result).toEqual([])
})

test(`it transforms multiple image references in markdown`, async () => {
  const imagePaths = [`images/my-image.jpeg`, `images/other-image.jpeg`]

  const content = `
[refImage1]: ./${imagePaths[0]} "Ref1 Image Title"
[refImage2]: ./${imagePaths[1]} "Ref2 Image Title"
![image 1][refImage1]
![image 2][refImage2]
  `.trim()

  const nodes = await plugin(createPluginOptions(content, imagePaths))

  expect(nodes.length).toBe(imagePaths.length)
})

test(`it transforms multiple image links and image references in markdown`, async () => {
  const imagePaths = [`images/my-image.jpeg`, `images/other-image.jpeg`]

  const content = `
[refImage1]: ./${imagePaths[0]} "Ref1 Image Title"
[refImage2]: ./${imagePaths[1]} "Ref2 Image Title"
![image 1][refImage1]
![image 2][refImage2]
![image 1](./${imagePaths[0]})
![image 2](./${imagePaths[1]})
  `.trim()

  const nodes = await plugin(createPluginOptions(content, imagePaths))

  expect(nodes.length).toBe(imagePaths.length * 2)
})

test(`it transforms HTML img tags`, async () => {
  const imagePath = `image/my-image.jpeg`

  const content = `
<img src="./${imagePath}">
  `.trim()

  const nodes = await plugin(createPluginOptions(content, imagePath))

  expect(nodes.length).toBe(1)

  const node = nodes.pop()
  expect(node.type).toBe(`html`)
  expect(node.value).toMatchSnapshot()
  expect(node.value).not.toMatch(`<html>`)
})

test(`it leaves non-relative HTML img tags alone`, async () => {
  const imagePath = `https://google.com/images/this-was-an-image.jpeg`

  const content = `
<img src="${imagePath}">
  `.trim()

  const nodes = await plugin(createPluginOptions(content, imagePath))
  expect(nodes[0].value).toBe(content)
})

test(`it leaves images that are already linked alone`, async () => {
  const imagePath = `image/my-image.jpg`
  const content = `
[![img](./${imagePath})](https://google.com)
`

  const nodes = await plugin(createPluginOptions(content, imagePath))
  const node = nodes.pop()

  expect(node.type).toBe(`html`)
  expect(node.value).toMatchSnapshot()
  expect(node.value).not.toMatch(`<html>`)
})

test(`it leaves linked HTML img tags alone`, async () => {
  const imagePath = `images/this-image-already-has-a-link.jpeg`

  const content = `
<a href="https://example.org">
  <img src="./${imagePath}">
</a>
  `.trim()

  const nodes = await plugin(createPluginOptions(content, imagePath))
  const node = nodes.pop()

  expect(node.type).toBe(`html`)
  expect(node.value).toMatchSnapshot()
  expect(node.value).not.toMatch(`<html>`)
})

test(`it leaves single-line linked HTML img tags alone`, async () => {
  const imagePath = `images/this-image-already-has-a-link.jpeg`

  const content = `
<a href="https://example.org"><img src="./${imagePath}"></a>
  `.trim()

  const nodes = await plugin(createPluginOptions(content, imagePath))
  const node = nodes.pop()

  expect(node.type).toBe(`html`)
  expect(node.value).toMatchSnapshot()
  expect(node.value).not.toMatch(`<html>`)
})

test(`it handles goofy nesting properly`, async () => {
  const imagePath = `images/this-image-already-has-a-link.jpeg`

  const content = `
  <a href="https://google.com">**![test](./${imagePath})**</a>
  `.trim()

  const nodes = await plugin(createPluginOptions(content, imagePath))
  const node = nodes.pop()

  expect(node.type).toBe(`html`)
  expect(node.value).toMatchSnapshot()
  expect(node.value).not.toMatch(`<html>`)
})

test(`it transforms HTML img tags with query strings`, async () => {
  const imagePath = `image/my-image.jpeg?query=string`

  const content = `
<img src="./${imagePath}">
  `.trim()

  const nodes = await plugin(createPluginOptions(content, imagePath))

  expect(nodes.length).toBe(1)

  const node = nodes.pop()
  expect(node.type).toBe(`html`)
  expect(node.value).toMatchSnapshot()
  expect(node.value).not.toMatch(`<html>`)
})

test(`it transforms images in markdown with query strings`, async () => {
  const imagePath = `images/my-image.jpeg?query=string`
  const content = `

![image](./${imagePath})
  `.trim()

  const nodes = await plugin(createPluginOptions(content, imagePath))

  expect(nodes.length).toBe(1)

  const node = nodes.pop()
  expect(node.type).toBe(`html`)
  expect(node.value).toMatchSnapshot()
  expect(node.value).not.toMatch(`<html>`)
})

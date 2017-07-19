jest.mock(`gatsby-plugin-sharp`, () => {
  return {
    responsiveSizes({ file, args }) {
      return Promise.resolve({
        aspectRatio: 0.75,
        originalImage: file.absolutePath,
        src: file.absolutePath,
        srcSet: `${file.absolutePath}, ${file.absolutePath}`,
        sizes: `(max-width: ${args.maxWidth}px) 100vw, ${args.maxWidth}px`,
        base64: `url('data:image/png;base64, iVBORw)`,
      })
    },
  }
})

const Remark = require(`remark`)

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
    files: [].concat(imagePaths).map(imagePath => {return {
      absolutePath: `${dirName}/${imagePath}`,
    }}),
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
})

test(`it leaves non-relative HTML img tags alone`, async () => {
  const imagePath = `https://google.com/images/this-was-an-image.jpeg`

  const content = `
<img src="${imagePath}">
  `.trim()

  const nodes = await plugin(createPluginOptions(content, imagePath))

  expect(nodes.length).toBe(0)
})

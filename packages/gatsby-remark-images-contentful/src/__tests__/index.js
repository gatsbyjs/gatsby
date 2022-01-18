jest.mock(`../utils/`, () => {
  return {
    getBase64Img: jest.fn().mockReturnValue(`data:image;`),
    buildResponsiveSizes: jest.fn().mockReturnValue({
      base64: `data:image;`,
      aspectRatio: 1,
      srcSet: `srcSet`,
      webpSrcSet: `webpSrcSet`,
      src: `imageUrl`,
      sizes: [`128px`, `250px`],
      density: 140,
      presentationWidth: 600,
      presentationHeight: 450,
    }),
  }
})

jest.mock(`axios`)

jest.mock(`sharp`, () => {
  const metadataMock = jest.fn(() => {
    return {
      width: 200,
      height: 200,
      density: 75,
    }
  })

  const sharp = () => {
    const pipeline = {
      metadata: metadataMock,
    }

    return pipeline
  }

  sharp.simd = jest.fn()
  sharp.concurrency = jest.fn()
  sharp.metadataMock = metadataMock

  return sharp
})

const sharp = require(`sharp`)
const mockSharpFailure = () => {
  sharp.metadataMock.mockRejectedValueOnce(new Error(`invalid image`))
}

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

const createPluginOptions = (content, imagePaths = `/`, options = {}) => {
  const dirName = `not-a-real-dir`
  return {
    files: [].concat(imagePaths).map(imagePath => {
      return {
        absolutePath: `${dirName}/${imagePath}`,
      }
    }),
    markdownNode: createNode(content),
    markdownAST: remark.parse(content),
    cache: { get: jest.fn(), set: jest.fn() },
    getNode: () => {
      return {
        dir: dirName,
      }
    },
    createContentDigest: jest.fn().mockReturnValue(`contentDigest`),
    ...options,
  }
}
const Remark = require(`remark`)
const plugin = require(`../index`)
const remark = new Remark().data(`settings`, {
  commonmark: true,
  footnotes: true,
  pedantic: true,
})
const axios = require(`axios`)

beforeEach(() => {
  axios.mockClear()
  axios.mockImplementation(() =>
    Promise.resolve({
      data: {
        pipe: jest.fn(),
        destroy: jest.fn(),
      },
    })
  )
})

test(`it returns empty array when 0 images`, async () => {
  const content = `
# hello world
Look ma, no images
  `.trim()

  const result = await plugin(createPluginOptions(content))

  expect(result).toEqual([])
})

test(`it leaves relative images alone`, async () => {
  const imagePath = `images/an-image.jpeg`
  const content = `
![asdf](${imagePath})
  `.trim()

  const result = await plugin(createPluginOptions(content, imagePath))

  expect(result).toEqual([])
})

test(`it leaves non-contentful images alone`, async () => {
  const imagePath = `//google.com/images/an-image.jpeg`
  const content = `
![asdf](${imagePath})
  `.trim()

  const result = await plugin(createPluginOptions(content, imagePath))

  expect(result).toEqual([])
})

test(`it transforms images in markdown`, async () => {
  const imagePath = `//images.ctfassets.net/rocybtov1ozk/wtrHxeu3zEoEce2MokCSi/73dce36715f16e27cf5ff0d2d97d7dff/quwowooybuqbl6ntboz3.jpg`
  const content = `
![image](${imagePath})
  `.trim()
  const nodes = await plugin(createPluginOptions(content, imagePath))

  expect(nodes.length).toBe(1)

  const node = nodes.pop()
  expect(node.type).toBe(`html`)
  expect(node.value).toMatchSnapshot()
  expect(node.value).not.toMatch(`<html>`)
})

test(`it transforms images with a https scheme in markdown`, async () => {
  const imagePath = `https://images.ctfassets.net/rocybtov1ozk/wtrHxeu3zEoEce2MokCSi/73dce36715f16e27cf5ff0d2d97d7dff/quwowooybuqbl6ntboz3.jpg`
  const content = `
![image](${imagePath})
  `.trim()

  const nodes = await plugin(createPluginOptions(content, imagePath))

  expect(nodes.length).toBe(1)

  const node = nodes.pop()
  expect(node.type).toBe(`html`)
  expect(node.value).toMatchSnapshot()
  expect(node.value).not.toMatch(`<html>`)
})

test(`it throws specific error if the image is not found`, async () => {
  axios.mockImplementationOnce(() => Promise.reject(new Error(`oh no`)))
  const reporter = {
    panic: jest.fn(),
  }
  const imagePath = `https://images.ctfassets.net/rocybtov1ozk/wtrHxeu3zEoEce2MokCSi/73dce36715f16e27cf5ff0d2d97d7dff/doesnotexist.jpg`
  const content = `
![image](${imagePath})
  `.trim()

  await plugin(createPluginOptions(content, imagePath, { reporter }))
  expect(reporter.panic).toHaveBeenCalledTimes(1)
  expect(reporter.panic).toHaveBeenCalledWith(
    `Image downloading failed for ${imagePath}, please check if the image still exists on contentful`,
    expect.any(Error)
  )
})

test(`it transforms multiple images in markdown`, async () => {
  const imagePaths = [
    `//images.ctfassets.net/rocybtov1ozk/wtrHxeu3zEoEce2MokCSi/73dce36715f16e27cf5ff0d2d97d7dff/quwowooybuqbl6ntboz3.jpg`,
    `//images.ctfassets.net/rocybtov1ozk/wtrHxeu3zEoEce2MokCSi/73dce36715f16e27cf5ff0d2d97d7dff/quwowooybuqbl6ntboz3.jpg`,
  ]

  const content = `
![image 1](${imagePaths[0]})
![image 2](${imagePaths[1]})
  `.trim()

  const nodes = await plugin(createPluginOptions(content, imagePaths))

  expect(nodes.length).toBe(imagePaths.length)
})

test(`it transforms HTML img tags`, async () => {
  const imagePath = `//images.ctfassets.net/rocybtov1ozk/wtrHxeu3zEoEce2MokCSi/73dce36715f16e27cf5ff0d2d97d7dff/quwowooybuqbl6ntboz3.jpg`

  const content = `
<img src="${imagePath}">
  `.trim()

  const nodes = await plugin(createPluginOptions(content, imagePath))

  expect(nodes.length).toBe(1)

  const node = nodes.pop()
  expect(node.type).toBe(`html`)
  expect(node.value).toMatchSnapshot()
  expect(node.value).not.toMatch(`<html>`)
})

test(`it leaves relative HTML img tags alone`, async () => {
  const imagePath = `images/this-was-an-image.jpeg`

  const content = `
<img src="${imagePath}">
  `.trim()

  const nodes = await plugin(createPluginOptions(content, imagePath))
  expect(nodes[0].value).toBe(content)
})

test(`it transforms images in markdown with webp srcSets if option is enabled`, async () => {
  const imagePath = `//images.ctfassets.net/rocybtov1ozk/wtrHxeu3zEoEce2MokCSi/73dce36715f16e27cf5ff0d2d97d7dff/quwowooybuqbl6ntboz3.jpg`
  const content = `
![image](${imagePath})
  `.trim()

  const nodes = await plugin(createPluginOptions(content, imagePath), {
    withWebp: true,
  })

  expect(nodes.length).toBe(1)

  const node = nodes.pop()
  expect(node.type).toBe(`html`)
  expect(node.value).toMatchSnapshot()
  expect(node.value).not.toMatch(`<html>`)
})

test(`it shows an useful error message when the file is not a valid image`, async () => {
  mockSharpFailure()

  const imagePath = `//images.ctfassets.net/k8iqpp6u0ior/752jwCIe9dwtfi9mLbp9m2/bc588ee25cf8299bc33a56ca32f8677b/Gatsby-Logos.zip`

  const content = `
![image](${imagePath})
  `.trim()

  const reporter = {
    panic: jest.fn(),
  }

  await plugin(createPluginOptions(content, imagePath, { reporter }))

  expect(reporter.panic).toHaveBeenCalledTimes(1)
  expect(reporter.panic).toHaveBeenCalledWith(
    `The image "${imagePath}" (with alt text: "image") doesn't appear to be a supported image format.`,
    expect.any(Error)
  )
})

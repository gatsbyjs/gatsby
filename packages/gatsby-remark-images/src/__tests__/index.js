const mockTraceSVG = jest.fn(
  async () => `data:image/svg+xml,%3csvg 'MOCK SVG'%3c/svg%3e`
)

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
        base64: `data:image/png;base64,iVBORw`,
      })
    },
    traceSVG: mockTraceSVG,
    stats() {
      return Promise.resolve({
        isTransparent: true,
      })
    },
  }
})

const Remark = require(`remark`)
const { Potrace } = require(`potrace`)
const cheerio = require(`cheerio`)
const toHAST = require(`mdast-util-to-hast`)
const hastToHTML = require(`hast-util-to-html`)

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
        absolutePath: `${dirName}/${imagePath.split(`?`)[0]}`,
      }
    }),
    markdownNode: createNode(content),
    markdownAST: remark.parse(content),
    getNode: () => {
      return {
        dir: dirName,
      }
    },
    compiler: {
      parseString: remark.parse.bind(remark),
      generateHTML: node => hastToHTML(toHAST(node)),
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

test(`it transforms images in markdown with the "withWebp" option`, async () => {
  const imagePath = `images/my-image.jpeg`
  const content = `

![image](./${imagePath})
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

test(`it transforms images in markdown with the "withAvif" option`, async () => {
  const imagePath = `images/my-image.jpeg`
  const content = `

![image](./${imagePath})
  `.trim()

  const nodes = await plugin(createPluginOptions(content, imagePath), {
    withAvif: true,
  })

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

test(`it uses tracedSVG placeholder when enabled`, async () => {
  const imagePath = `images/my-image.jpeg`
  const content = `
![image](./${imagePath})
  `.trim()

  const nodes = await plugin(createPluginOptions(content, imagePath), {
    tracedSVG: { color: `COLOR_AUTO`, turnPolicy: `TURNPOLICY_LEFT` },
  })

  expect(nodes.length).toBe(1)

  const node = nodes.pop()
  expect(node.type).toBe(`html`)
  expect(node.value).toMatchSnapshot()
  expect(node.value).not.toMatch(`<html>`)
  expect(mockTraceSVG).toBeCalledTimes(1)

  expect(mockTraceSVG).toBeCalledWith(
    expect.objectContaining({
      // fileArgs cannot be left undefined or traceSVG errors
      fileArgs: expect.any(Object),
      // args containing Potrace constants should be translated to their values
      args: { color: Potrace.COLOR_AUTO, turnPolicy: Potrace.TURNPOLICY_LEFT },
    })
  )
})

describe(`showCaptions`, () => {
  it(`display title as caption when showCaptions === true`, async () => {
    const imagePath = `images/my-image.jpeg`
    const content = `![some alt](./${imagePath} "some title")`

    const nodes = await plugin(createPluginOptions(content, imagePath), {
      showCaptions: true,
    })
    expect(nodes.length).toBe(1)

    const node = nodes.pop()
    const $ = cheerio.load(node.value)
    expect($(`figcaption`).text()).toEqual(`some title`)
    expect(node.value).toMatchSnapshot()
  })

  it(`display nothing as caption when showCaptions === false`, async () => {
    const imagePath = `images/my-image.jpeg`
    const content = `![some alt](./${imagePath} "some title")`

    const nodes = await plugin(createPluginOptions(content, imagePath), {
      showCaptions: false,
    })
    expect(nodes.length).toBe(1)

    const node = nodes.pop()
    const $ = cheerio.load(node.value)
    expect($(`figcaption`).length).toBe(0)
  })

  it(`display nothing as caption when showCaptions === []`, async () => {
    const imagePath = `images/my-image.jpeg`
    const content = `![some alt](./${imagePath} "some title")`

    const nodes = await plugin(createPluginOptions(content, imagePath), {
      showCaptions: [],
    })
    expect(nodes.length).toBe(1)

    const node = nodes.pop()
    const $ = cheerio.load(node.value)
    expect($(`figcaption`).length).toBe(0)
  })

  it(`display alt as caption if title was not found and showCaptions === true`, async () => {
    const imagePath = `images/my-image.jpeg`
    const content = `![some alt](./${imagePath})`

    const nodes = await plugin(createPluginOptions(content, imagePath), {
      showCaptions: true,
    })
    expect(nodes.length).toBe(1)

    const node = nodes.pop()
    const $ = cheerio.load(node.value)
    expect($(`figcaption`).text()).toEqual(`some alt`)
    expect(node.value).toMatchSnapshot()
  })

  it(`display nothing as caption if no title or alt`, async () => {
    const imagePath = `images/my-image.jpeg`
    const content = `![](./${imagePath})`

    const nodes = await plugin(createPluginOptions(content, imagePath), {
      showCaptions: true,
    })
    expect(nodes.length).toBe(1)

    const node = nodes.pop()
    const $ = cheerio.load(node.value)
    expect($(`figcaption`).length).toBe(0)
  })

  it(`display alt as caption if specified first in showCaptions array`, async () => {
    const imagePath = `images/my-image.jpeg`
    const content = `![some alt](./${imagePath} "some title")`

    const nodes = await plugin(createPluginOptions(content, imagePath), {
      showCaptions: [`alt`, `title`],
    })
    expect(nodes.length).toBe(1)

    const node = nodes.pop()
    const $ = cheerio.load(node.value)
    expect($(`figcaption`).text()).toEqual(`some alt`)
    expect(node.value).toMatchSnapshot()
  })

  it(`display title as caption if specified first in showCaptions array`, async () => {
    const imagePath = `images/my-image.jpeg`
    const content = `![some alt](./${imagePath} "some title")`

    const nodes = await plugin(createPluginOptions(content, imagePath), {
      showCaptions: [`title`, `alt`],
    })
    expect(nodes.length).toBe(1)

    const node = nodes.pop()
    const $ = cheerio.load(node.value)
    expect($(`figcaption`).text()).toEqual(`some title`)
    expect(node.value).toMatchSnapshot()
  })

  it(`display alt as caption if specified in showCaptions array`, async () => {
    const imagePath = `images/my-image.jpeg`
    const content = `![some alt](./${imagePath} "some title")`

    const nodes = await plugin(createPluginOptions(content, imagePath), {
      showCaptions: [`alt`],
    })
    expect(nodes.length).toBe(1)

    const node = nodes.pop()
    const $ = cheerio.load(node.value)
    expect($(`figcaption`).text()).toEqual(`some alt`)
    expect(node.value).toMatchSnapshot()
  })

  it(`display title as caption if specified in showCaptions array`, async () => {
    const imagePath = `images/my-image.jpeg`
    const content = `![some alt](./${imagePath} "some title")`

    const nodes = await plugin(createPluginOptions(content, imagePath), {
      showCaptions: [`title`],
    })
    expect(nodes.length).toBe(1)

    const node = nodes.pop()
    const $ = cheerio.load(node.value)
    expect($(`figcaption`).text()).toEqual(`some title`)
    expect(node.value).toMatchSnapshot()
  })

  it(`fallback to alt as caption if specified second in showCaptions array`, async () => {
    const imagePath = `images/my-image.jpeg`
    const content = `![some alt](./${imagePath})`

    const nodes = await plugin(createPluginOptions(content, imagePath), {
      showCaptions: [`title`, `alt`],
    })
    expect(nodes.length).toBe(1)

    const node = nodes.pop()
    const $ = cheerio.load(node.value)
    expect($(`figcaption`).text()).toEqual(`some alt`)
    expect(node.value).toMatchSnapshot()
  })

  it(`fallback to title as caption if specified second in showCaptions array`, async () => {
    const imagePath = `images/my-image.jpeg`
    const content = `![](./${imagePath} "some title")`

    const nodes = await plugin(createPluginOptions(content, imagePath), {
      showCaptions: [`alt`, `title`],
    })
    expect(nodes.length).toBe(1)

    const node = nodes.pop()
    const $ = cheerio.load(node.value)
    expect($(`figcaption`).text()).toEqual(`some title`)
    expect(node.value).toMatchSnapshot()
  })

  it(`fallback to no caption if no match can be found`, async () => {
    const imagePath = `images/my-image.jpeg`
    const content = `![some alt](./${imagePath})`

    const nodes = await plugin(createPluginOptions(content, imagePath), {
      showCaptions: [`title`],
    })

    expect(nodes.length).toBe(1)

    const node = nodes.pop()
    const $ = cheerio.load(node.value)
    expect($(`figcaption`).length).toBe(0)
  })

  it(`display alt as caption if specified in showCaptions array, even if it matches filename`, async () => {
    const imagePath = `images/my-image.jpeg`
    const content = `![my image](./${imagePath} "some title")`

    const nodes = await plugin(createPluginOptions(content, imagePath), {
      showCaptions: [`alt`],
    })
    expect(nodes.length).toBe(1)

    const node = nodes.pop()
    const $ = cheerio.load(node.value)
    expect($(`figcaption`).html()).toEqual(`my image`)
    expect(node.value).toMatchSnapshot()
  })
})

describe(`markdownCaptions`, () => {
  it(`display title in markdown as caption when showCaptions === true && markdownCaptions === true`, async () => {
    const imagePath = `images/my-image.jpeg`
    const content = `![some alt](./${imagePath} "some _title_")`

    const nodes = await plugin(createPluginOptions(content, imagePath), {
      showCaptions: true,
      markdownCaptions: true,
    })
    expect(nodes.length).toBe(1)

    const node = nodes.pop()
    const $ = cheerio.load(node.value)
    expect($(`figcaption`).html()).toEqual(`<p>some <em>title</em></p>`)
    expect(node.value).toMatchSnapshot()
  })

  it(`display title in text as caption when showCaptions === true && markdownCaptions === false`, async () => {
    const imagePath = `images/my-image.jpeg`
    const content = `![some alt](./${imagePath} "some _title_")`

    const nodes = await plugin(createPluginOptions(content, imagePath), {
      showCaptions: true,
      markdownCaptions: false,
    })
    expect(nodes.length).toBe(1)

    const node = nodes.pop()
    const $ = cheerio.load(node.value)
    expect($(`figcaption`).html()).toEqual(`some _title_`)
    expect(node.value).toMatchSnapshot()
  })

  it(`display nothing as caption when showCaptions === false && markdownCaptions === true`, async () => {
    const imagePath = `images/my-image.jpeg`
    const content = `![some alt](./${imagePath} "some _title_")`

    const nodes = await plugin(createPluginOptions(content, imagePath), {
      showCaptions: false,
      markdownCaptions: true,
    })
    expect(nodes.length).toBe(1)

    const node = nodes.pop()
    const $ = cheerio.load(node.value)
    expect($(`figcaption`).length).toBe(0)
  })
})

describe(`disableBgImageOnAlpha`, () => {
  it(`does not disable background image on transparent images when disableBgImageOnAlpha === false`, async () => {
    const imagePath = `images/my-image.jpeg`
    const content = `![some alt](./${imagePath} "some title")`

    const nodes = await plugin(createPluginOptions(content, imagePath), {
      disableBgImageOnAlpha: false,
    })
    expect(nodes.length).toBe(1)

    const node = nodes.pop()
    expect(node.type).toBe(`html`)
    expect(node.value).toMatchSnapshot()
  })

  it(`disables background image on transparent images when disableBgImageOnAlpha === true`, async () => {
    const imagePath = `images/my-image.jpeg`
    const content = `![some alt](./${imagePath} "some title")`

    const nodes = await plugin(createPluginOptions(content, imagePath), {
      disableBgImageOnAlpha: true,
    })
    expect(nodes.length).toBe(1)

    const node = nodes.pop()
    expect(node.type).toBe(`html`)
    expect(node.value).toMatchSnapshot()
  })
})

describe(`disableBgImage`, () => {
  it(`does not disable background image when disableBgImage === false`, async () => {
    const imagePath = `images/my-image.jpeg`
    const content = `![some alt](./${imagePath} "some title")`

    const nodes = await plugin(createPluginOptions(content, imagePath), {
      disableBgImage: false,
    })
    expect(nodes.length).toBe(1)

    const node = nodes.pop()
    expect(node.type).toBe(`html`)
    expect(node.value).toMatchSnapshot()
  })

  it(`disables background image when disableBgImage === true`, async () => {
    const imagePath = `images/my-image.jpeg`
    const content = `![some alt](./${imagePath} "some title")`

    const nodes = await plugin(createPluginOptions(content, imagePath), {
      disableBgImage: true,
    })
    expect(nodes.length).toBe(1)

    const node = nodes.pop()
    expect(node.type).toBe(`html`)
    expect(node.value).toMatchSnapshot()
  })
})

describe(`image alt attribute`, () => {
  it(`should be generated correctly`, async () => {
    const imagePath = `images/my-image.jpeg`
    const content = `![testing-if-alt-is-correct](./${imagePath} "some title")`

    const nodes = await plugin(createPluginOptions(content, imagePath))
    expect(nodes.length).toBe(1)

    const node = nodes.pop()
    const $ = cheerio.load(node.value)
    expect($(`img`).attr(`alt`)).toEqual(`testing-if-alt-is-correct`)
  })

  it(`should use escaped filename as fallback`, async () => {
    const imagePath = `images/my-image.jpeg`
    const content = `![](./${imagePath} "some title")`

    const nodes = await plugin(createPluginOptions(content, imagePath))
    expect(nodes.length).toBe(1)

    const node = nodes.pop()
    const $ = cheerio.load(node.value)
    expect($(`img`).attr(`alt`)).toEqual(`my image`)
  })

  it(`should be able to consider EMPTY_ALT`, async () => {
    const imagePath = `images/my-image.jpeg`
    const content = `![GATSBY_EMPTY_ALT](./${imagePath} "some title")`

    const nodes = await plugin(createPluginOptions(content, imagePath))
    expect(nodes.length).toBe(1)

    const node = nodes.pop()
    const $ = cheerio.load(node.value)
    expect($(`img`).attr(`alt`)).toEqual(``)
  })
})

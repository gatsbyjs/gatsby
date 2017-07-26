jest.mock(`fs-extra`, () => {
  return {
    existsSync: () => false,
    copy: jest.fn(),
  }
})
const Remark = require(`remark`)
const fsExtra = require(`fs-extra`)
const path = require(`path`)

const plugin = require(`../`)

const remark = new Remark().data(`settings`, {
  commonmark: true,
  footnotes: true,
  pedantic: true,
})

describe(`gatsby-remark-copy-linked-files`, () => {
  afterEach(() => {
    fsExtra.copy.mockReset()
  })

  const markdownNode = {
    parent: {},
  }
  const getNode = () => {return {
    dir: ``,
    internal: {
      type: `File`,
    },
  }}
  const getFiles = filePath => [
      {
        absolutePath: path.normalize(filePath),
        internal: {},
        extension: filePath.split(`.`).pop().trim(),
      },
    ]

  describe(`images`, () => {
    ;[`svg`, `gif`].forEach(extension => {
      it(`can copy .${extension}`, () => {
        const path = `images/sample-image.${extension}`
        const markdownAST = remark.parse(`![some image](${path})`)

        plugin({ files: getFiles(path), markdownAST, markdownNode, getNode })

        expect(fsExtra.copy).toHaveBeenCalledWith(
          expect.any(String),
          expect.any(String),
          expect.any(Function)
        )
      })
    })

    ;[`png`, `jpg`, `jpeg`].forEach(extension => {
      it(`ignores images with .${extension}`, () => {
        const path = `images/sample-image.${extension}`
        const markdownAST = remark.parse(`![some image](${path})`)

        plugin({ files: getFiles(path), markdownAST, markdownNode, getNode })

        expect(fsExtra.copy).not.toHaveBeenCalled()
      })
    })
  })

  it(`can copy file links`, () => {
    const path = `files/sample-file.txt`

    const markdownAST = remark.parse(`[path to file](${path})`)

    plugin({ files: getFiles(path), markdownAST, markdownNode, getNode })

    expect(fsExtra.copy).toHaveBeenCalled()
  })

  it(`can copy HTML images`, () => {
    const path = `images/sample-image.gif`

    const markdownAST = remark.parse(`<img src="${path}">`)

    plugin({ files: getFiles(path), markdownAST, markdownNode, getNode })

    expect(fsExtra.copy).toHaveBeenCalled()
  })

  it(`leaves absolute file paths alone`, () => {
    const path = `https://google.com/images/sample-image.gif`

    const markdownAST = remark.parse(`![some absolute image](${path})`)

    plugin({ files: getFiles(path), markdownAST, markdownNode, getNode })

    expect(fsExtra.copy).not.toHaveBeenCalled()
  })
})

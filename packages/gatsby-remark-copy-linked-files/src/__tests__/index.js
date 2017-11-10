jest.mock(`fs-extra`, () => {
  return {
    existsSync: () => false,
    copy: jest.fn(),
    ensureDir: jest.fn(),
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

const imageURL = markdownAST => markdownAST.children[0].children[0].url

describe(`gatsby-remark-copy-linked-files`, () => {
  afterEach(() => {
    fsExtra.copy.mockReset()
  })

  const markdownNode = {
    parent: {},
  }
  const getNode = () => {
    return {
      dir: ``,
      internal: {
        type: `File`,
      },
    }
  }
  const getFiles = filePath => [
    {
      absolutePath: path.posix.normalize(filePath),
      internal: {},
      extension: filePath
        .split(`.`)
        .pop()
        .trim(),
    },
  ]

  describe(`images`, () => {
    ;[`svg`, `gif`].forEach(extension => {
      it(`can copy .${extension}`, async () => {
        const path = `images/sample-image.${extension}`
        const markdownAST = remark.parse(`![some image](${path})`)

        await plugin({
          files: getFiles(path),
          markdownAST,
          markdownNode,
          getNode,
        })

        expect(fsExtra.copy).toHaveBeenCalledWith(
          expect.any(String),
          expect.any(String)
        )
      })
    })
    ;[`png`, `jpg`, `jpeg`].forEach(extension => {
      it(`ignores images with .${extension}`, async () => {
        const path = `images/sample-image.${extension}`
        const markdownAST = remark.parse(`![some image](${path})`)

        await plugin({
          files: getFiles(path),
          markdownAST,
          markdownNode,
          getNode,
        })

        expect(fsExtra.copy).not.toHaveBeenCalled()
      })
    })
  })

  it(`can copy file links`, async () => {
    const path = `files/sample-file.txt`

    const markdownAST = remark.parse(`[path to file](${path})`)

    await plugin({ files: getFiles(path), markdownAST, markdownNode, getNode })

    expect(fsExtra.copy).toHaveBeenCalled()
  })

  it(`can copy HTML images`, async () => {
    const path = `images/sample-image.gif`

    const markdownAST = remark.parse(`<img src="${path}">`)

    await plugin({ files: getFiles(path), markdownAST, markdownNode, getNode })

    expect(fsExtra.copy).toHaveBeenCalled()
  })

  it(`can copy HTML multiple images`, async () => {
    const path1 = `images/sample-image.gif`
    const path2 = `images/another-sample-image.gif`

    const markdownAST = remark.parse(
      `<div><img src="${path1}"><img src="${path2}"></div>`
    )

    await plugin({
      files: [...getFiles(path1), ...getFiles(path2)],
      markdownAST,
      markdownNode,
      getNode,
    })

    expect(fsExtra.copy).toHaveBeenCalledTimes(2)
  })

  it(`leaves absolute file paths alone`, async () => {
    const path = `https://google.com/images/sample-image.gif`

    const markdownAST = remark.parse(`![some absolute image](${path})`)

    await plugin({ files: getFiles(path), markdownAST, markdownNode, getNode })

    expect(fsExtra.copy).not.toHaveBeenCalled()
  })

  describe(`options.destinationDir`, () => {
    const imagePath = `images/sample-image.gif`

    it(`throws an error if the destination directory is not within 'public'`, async () => {
      const markdownAST = remark.parse(`![some absolute image](${imagePath})`)
      const invalidDestinationDir = `../destination`
      expect.assertions(2)
      return plugin(
        { files: getFiles(imagePath), markdownAST, markdownNode, getNode },
        {
          destinationDir: invalidDestinationDir,
        }
      ).catch(e => {
        expect(e).toEqual(expect.stringContaining(invalidDestinationDir))
        expect(fsExtra.copy).not.toHaveBeenCalled()
      })
    })

    it(`copies file to destinationDir when supplied`, async () => {
      const markdownAST = remark.parse(`![some absolute image](${imagePath})`)
      const validDestinationDir = `path/to/dir`
      const expectedNewPath = path.posix.join(
        process.cwd(),
        `public`,
        validDestinationDir,
        `/undefined-undefined.gif`
      )
      expect.assertions(3)
      await plugin(
        { files: getFiles(imagePath), markdownAST, markdownNode, getNode },
        {
          destinationDir: validDestinationDir,
        }
      ).then(v => {
        expect(v).toBeDefined()
        expect(fsExtra.copy).toHaveBeenCalledWith(imagePath, expectedNewPath)
        expect(imageURL(markdownAST)).toEqual(
          `/path/to/dir/undefined-undefined.gif`
        )
      })
    })

    it(`copies file to root dir when not supplied'`, async () => {
      const markdownAST = remark.parse(`![some absolute image](${imagePath})`)
      const expectedNewPath = path.posix.join(
        process.cwd(),
        `public`,
        `/undefined-undefined.gif`
      )
      expect.assertions(3)
      await plugin({
        files: getFiles(imagePath),
        markdownAST,
        markdownNode,
        getNode,
      }).then(v => {
        expect(v).toBeDefined()
        expect(fsExtra.copy).toHaveBeenCalledWith(imagePath, expectedNewPath)
        expect(imageURL(markdownAST)).toEqual(`/undefined-undefined.gif`)
      })
    })
  })
})

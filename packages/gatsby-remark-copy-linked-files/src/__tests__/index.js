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

  const parentDir = `/`
  const markdownNode = {
    parent: {},
  }
  const getNode = () => {
    return {
      dir: parentDir,
      internal: {
        type: `File`,
      },
    }
  }
  const getFiles = filePath => {
    const absolutePath = path.posix.normalize(parentDir + filePath)
    return [
      {
        absolutePath,
        name: path.basename(absolutePath, path.extname(absolutePath)),
        internal: {
          contentDigest: `some-hash`,
        },
        extension: filePath.split(`.`).pop().trim(),
      },
    ]
  }

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

  it(`can copy reference-style images`, async () => {
    const path = `images/sample-image.gif`

    const markdownAST = remark.parse(`![sample][1]\n\n[1]: ${path}`)

    await plugin({ files: getFiles(path), markdownAST, markdownNode, getNode })

    expect(fsExtra.copy).toHaveBeenCalled()
  })

  it(`can copy file links`, async () => {
    const path = `files/sample-file.txt`

    const markdownAST = remark.parse(`[path to file](${path})`)

    await plugin({ files: getFiles(path), markdownAST, markdownNode, getNode })

    expect(fsExtra.copy).toHaveBeenCalled()
  })

  it(`can copy HTML file links`, async () => {
    const path = `files/sample-file.txt`

    const markdownAST = remark.parse(`<a href="${path}">link to file</a>`)

    await plugin({ files: getFiles(path), markdownAST, markdownNode, getNode })

    expect(fsExtra.copy).toHaveBeenCalled()
  })

  it(`can copy HTML images`, async () => {
    const path = `images/sample-image.gif`

    const markdownAST = remark.parse(`<img src="${path}">`)

    await plugin({ files: getFiles(path), markdownAST, markdownNode, getNode })

    expect(fsExtra.copy).toHaveBeenCalled()
  })

  it(`can copy JSX images`, async () => {
    const mdx = require(`remark-mdx`)
    const path = `images/sample-image.gif`

    const markdownAST = remark().use(mdx).parse(`<img src="${path}" />`)

    await plugin({
      files: getFiles(path),
      markdownAST,
      markdownNode,
      getNode,
    })

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

  it(`can copy HTML multiple images when some are in ignore extensions`, async () => {
    const path1 = `images/sample-image.jpg`
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

    expect(fsExtra.copy).toHaveBeenCalledTimes(1)
  })

  it(`can copy HTML videos`, async () => {
    const path = `videos/sample-video.mp4`

    const markdownAST = remark.parse(
      `<video controls="controls" autoplay="true" loop="true">\n<source type="video/mp4" src="${path}"></source>\n<p>Your browser does not support the video element.</p>\n</video>`
    )

    await plugin({ files: getFiles(path), markdownAST, markdownNode, getNode })

    expect(fsExtra.copy).toHaveBeenCalled()
  })

  it(`can copy HTML videos from video elements with the src attribute`, async () => {
    const path = `videos/sample-video.mp4`

    const markdownAST = remark.parse(
      `<video controls="controls" autoplay="true" src="${path}">\n<p>Your browser does not support the video element.</p>\n</video>`
    )

    await plugin({ files: getFiles(path), markdownAST, markdownNode, getNode })

    expect(fsExtra.copy).toHaveBeenCalled()
  })

  it(`can copy HTML images from video elements with the poster attribute `, async () => {
    const videoPath = `videos/sample-video.mp4`
    const posterPath = `images/sample-image.jpg`

    const markdownAST = remark.parse(
      `<video controls="controls" autoplay="true" src="${videoPath}" poster="${posterPath}">\n<p>Your browser does not support the video element.</p>\n</video>`
    )

    await plugin({
      files: [...getFiles(videoPath), ...getFiles(posterPath)],
      markdownAST,
      markdownNode,
      getNode,
    })

    expect(fsExtra.copy).toHaveBeenCalledTimes(2)
  })

  it(`can copy flash from object elements with the value attribute`, async () => {
    const path = `myMovie.swf`

    const markdownAST = remark.parse(
      `<object type="application/x-shockwave-flash">\n<param name="movie" value="${path}" />\n</object>`
    )

    await plugin({ files: getFiles(path), markdownAST, markdownNode, getNode })

    expect(fsExtra.copy).toHaveBeenCalled()
  })

  it(`can copy HTML videos when some siblings are in ignore extensions`, async () => {
    const path = `videos/sample-video.mp4`
    const path1 = `images/sample-image.jpg`

    const markdownAST = remark.parse(
      `<div><img src="${path1}"><video controls="controls" autoplay="true" loop="true">\n<source type="video/mp4" src="${path}"></source>\n<p>Your browser does not support the video element.</p>\n</video></div>`
    )

    await plugin({ files: getFiles(path), markdownAST, markdownNode, getNode })

    expect(fsExtra.copy).toHaveBeenCalled()
  })

  it(`leaves HTML nodes alone`, async () => {
    const openingTag = `<a href="http://example.com/">`

    const markdownAST = remark.parse(`${openingTag}Link to example.com</a>`)

    await plugin({
      markdownAST,
      markdownNode,
      getNode,
    }).then(() => {
      // we expect the resulting markdownAST to consist
      // of a paragraph with three children:
      // openingTag, text, and closing tag
      expect(markdownAST.children[0].children[0].value).toBe(openingTag)
    })
  })

  it(`leaves absolute file paths alone`, async () => {
    const path = `https://google.com/images/sample-image.gif`

    const markdownAST = remark.parse(`![some absolute image](${path})`)

    await plugin({ files: getFiles(path), markdownAST, markdownNode, getNode })

    expect(fsExtra.copy).not.toHaveBeenCalled()
  })

  it(`do nothing if dir is not found`, async () => {
    const getNode = () => {
      return {
        internal: {
          type: `Node`,
        },
      }
    }
    const path = `images/sample-image.gif`

    const markdownAST = remark.parse(`![sample][1]\n\n[1]: ${path}`)

    await plugin({ files: getFiles(path), markdownAST, markdownNode, getNode })

    expect(fsExtra.copy).not.toHaveBeenCalled()
  })

  describe(`respects pathPrefix`, () => {
    const imageName = `sample-image`
    const imageRelativePath = `images/${imageName}.svg`
    const imagePath = parentDir + imageRelativePath

    // pathPrefix passed to plugins already combine pathPrefix and assetPrefix
    it(`relative pathPrefix (no assetPrefix)`, async () => {
      const pathPrefix = `/path-prefix`
      const markdownAST = remark.parse(`![some image](${imageRelativePath})`)

      const expectedNewPath = path.posix.join(
        process.cwd(),
        `public`,
        `some-hash`,
        `sample-image.svg`
      )

      await plugin({
        files: getFiles(imagePath),
        markdownAST,
        markdownNode,
        getNode,
        pathPrefix,
      })

      expect(imageURL(markdownAST)).toEqual(
        `/path-prefix/some-hash/sample-image.svg`
      )

      expect(fsExtra.copy).toHaveBeenCalledWith(imagePath, expectedNewPath)
    })

    it(`absolute pathPrefix (with assetPrefix, empty base path prefix)`, async () => {
      const pathPrefix = `https://cdn.mysiteassets.com`
      const markdownAST = remark.parse(`![some image](${imageRelativePath})`)

      const expectedNewPath = path.posix.join(
        process.cwd(),
        `public`,
        `some-hash`,
        `sample-image.svg`
      )

      await plugin({
        files: getFiles(imagePath),
        markdownAST,
        markdownNode,
        getNode,
        pathPrefix,
      })

      expect(imageURL(markdownAST)).toEqual(
        `https://cdn.mysiteassets.com/some-hash/sample-image.svg`
      )

      expect(fsExtra.copy).toHaveBeenCalledWith(imagePath, expectedNewPath)
    })

    it(`absolute pathPrefix (with assetPrefix, and non-empty base path prefix)`, async () => {
      const pathPrefix = `https://cdn.mysiteassets.com/path-prefix`
      const markdownAST = remark.parse(`![some image](${imageRelativePath})`)

      const expectedNewPath = path.posix.join(
        process.cwd(),
        `public`,
        `some-hash`,
        `sample-image.svg`
      )

      await plugin({
        files: getFiles(imagePath),
        markdownAST,
        markdownNode,
        getNode,
        pathPrefix,
      })

      expect(imageURL(markdownAST)).toEqual(
        `https://cdn.mysiteassets.com/path-prefix/some-hash/sample-image.svg`
      )

      expect(fsExtra.copy).toHaveBeenCalledWith(imagePath, expectedNewPath)
    })
  })

  describe(`options.destinationDir`, () => {
    const imageName = `sample-image`
    const imageRelativePath = `images/${imageName}.gif`
    const imagePath = parentDir + imageRelativePath

    it(`throws an error if the destination supplied by destinationDir points outside of the root dir`, async () => {
      const markdownAST = remark.parse(
        `![some absolute image](${imageRelativePath})`
      )
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

    it(`throws an error if the destination supplied by the destinationDir function points outside of the root dir`, async () => {
      const markdownAST = remark.parse(
        `![some absolute image](${imageRelativePath})`
      )
      const invalidDestinationDir = `../destination`
      const customDestinationDir = f =>
        `../destination/${f.hash}/${f.name}/${f.notexist}`
      expect.assertions(2)
      return plugin(
        { files: getFiles(imagePath), markdownAST, markdownNode, getNode },
        {
          destinationDir: customDestinationDir,
        }
      ).catch(e => {
        expect(e).toEqual(expect.stringContaining(invalidDestinationDir))
        expect(fsExtra.copy).not.toHaveBeenCalled()
      })
    })

    it(`copies file to the destination supplied by destinationDir`, async () => {
      const markdownAST = remark.parse(
        `![some absolute image](${imageRelativePath})`
      )
      const validDestinationDir = `path/to/dir`
      const fileLocationPart = `some-hash/${imageName}.gif`
      const expectedNewPath = path.posix.join(
        process.cwd(),
        `public`,
        validDestinationDir,
        fileLocationPart
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
          `/path/to/dir/${fileLocationPart}`
        )
      })
    })

    it(`copies file to the destination supplied by the destinationDir function`, async () => {
      const markdownAST = remark.parse(
        `![some absolute image](${imageRelativePath})`
      )
      const customDestinationDir = f => `foo/${f.hash}--bar`
      const expectedDestination = `foo/some-hash--bar.gif`
      expect.assertions(3)
      await plugin(
        { files: getFiles(imagePath), markdownAST, markdownNode, getNode },
        { destinationDir: customDestinationDir }
      ).then(v => {
        const expectedNewPath = path.posix.join(
          ...[process.cwd(), `public`, expectedDestination]
        )
        expect(v).toBeDefined()
        expect(fsExtra.copy).toHaveBeenCalledWith(imagePath, expectedNewPath)
        expect(imageURL(markdownAST)).toEqual(`/${expectedDestination}`)
      })
    })

    it(`copies file to the destination supplied by destinationDir (with pathPrefix)`, async () => {
      const markdownAST = remark.parse(
        `![some absolute image](${imageRelativePath})`
      )
      const pathPrefix = `/blog`
      const validDestinationDir = `path/to/dir`

      const fileLocationPart = `some-hash/${imageName}.gif`
      const expectedNewPath = path.posix.join(
        process.cwd(),
        `public`,
        validDestinationDir,
        fileLocationPart
      )
      expect.assertions(3)
      await plugin(
        {
          files: getFiles(imagePath),
          markdownAST,
          markdownNode,
          pathPrefix,
          getNode,
        },
        {
          destinationDir: validDestinationDir,
        }
      ).then(v => {
        expect(v).toBeDefined()
        expect(fsExtra.copy).toHaveBeenCalledWith(imagePath, expectedNewPath)
        expect(imageURL(markdownAST)).toEqual(
          `${pathPrefix}/path/to/dir/${fileLocationPart}`
        )
      })
    })

    it(`copies file to the destination supplied by the destinationDir function (with pathPrefix)`, async () => {
      const markdownAST = remark.parse(
        `![some absolute image](${imageRelativePath})`
      )
      const pathPrefix = `/blog`
      const customDestinationDir = f => `hello${f.name}123`
      const expectedDestination = `hello${imageName}123.gif`
      expect.assertions(3)
      await plugin(
        {
          files: getFiles(imagePath),
          markdownAST,
          markdownNode,
          pathPrefix,
          getNode,
        },
        { destinationDir: customDestinationDir }
      ).then(v => {
        const expectedNewPath = path.posix.join(
          ...[process.cwd(), `public`, expectedDestination]
        )
        expect(v).toBeDefined()
        expect(fsExtra.copy).toHaveBeenCalledWith(imagePath, expectedNewPath)
        expect(imageURL(markdownAST)).toEqual(
          `${pathPrefix}/${expectedDestination}`
        )
      })
    })

    it(`copies file to the destination supplied by the destinationDir function (using returned absolutePath)`, async () => {
      const imgName = `sample-image`
      const imgRelPath = `images/nested-dir/${imgName}.gif`
      const imgPath = parentDir + imgRelPath

      const markdownAST = remark.parse(`![some absolute image](${imgRelPath})`)
      const customDestinationDir = f =>
        `${path.dirname(f.absolutePath)}/${f.name}`
      const expectedDestination = `images/nested-dir/sample-image.gif`
      expect.assertions(3)
      await plugin(
        { files: getFiles(imgPath), markdownAST, markdownNode, getNode },
        { destinationDir: customDestinationDir }
      ).then(v => {
        const expectedNewPath = path.posix.join(
          ...[process.cwd(), `public`, expectedDestination]
        )
        expect(v).toBeDefined()
        expect(fsExtra.copy).toHaveBeenCalledWith(imgPath, expectedNewPath)
        expect(imageURL(markdownAST)).toEqual(`/${expectedDestination}`)
      })
    })

    it(`copies file to the root dir when destinationDir is not supplied`, async () => {
      const markdownAST = remark.parse(
        `![some absolute image](${imageRelativePath})`
      )
      const expectedNewPath = path.posix.join(
        process.cwd(),
        `public`,
        `/some-hash/${imageName}.gif`
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
        expect(imageURL(markdownAST)).toEqual(`/some-hash/${imageName}.gif`)
      })
    })
  })

  describe(`options.ignoreFileExtensions`, () => {
    const pngImagePath = `images/sample-image.png`
    const jpgImagePath = `images/sample-image.jpg`
    const jpegImagePath = `images/sample-image.jpeg`
    const bmpImagePath = `images/sample-image.bmp`
    const tiffImagePath = `images/sample-image.tiff`

    it(`optionally copies PNG, JPG/JPEG, BPM and TIFF files`, async () => {
      const markdownAST = remark.parse(
        `![PNG](${pngImagePath}) ![JPG](${jpgImagePath}) ![JPEG](${jpegImagePath}) ![BPM](${bmpImagePath}) ![TIFF](${tiffImagePath})`
      )
      await plugin(
        {
          files: [
            ...getFiles(pngImagePath),
            ...getFiles(jpgImagePath),
            ...getFiles(jpegImagePath),
            ...getFiles(bmpImagePath),
            ...getFiles(tiffImagePath),
          ],
          markdownAST,
          markdownNode,
          getNode,
        },
        {
          ignoreFileExtensions: [],
        }
      )

      expect(fsExtra.copy).toHaveBeenCalledTimes(5)
    })
  })
})

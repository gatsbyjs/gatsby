const validatePath = require(`../validate-path`)
const createPath = require(`../create-path`)

describe(`JavaScript page creator`, () => {
  it(`includes the correct file types`, () => {
    const validFiles = [
      { path: `test1.js` },
      { path: `somedir/test1.js` },
      { path: `somedir/test2.ts` },
      { path: `somedir/dir2/test1.js` },
    ]

    expect(validFiles.filter(file => validatePath(file.path))).toEqual(
      validFiles
    )
  })

  it(`filters out files that start with underscores`, () => {
    const validFiles = [{ path: `something/blah.js` }, { path: `test1.js` }]

    const testFiles = validFiles.concat([
      { path: `something/_foo.js` },
      { path: `_blah.js` },
    ])

    expect(testFiles.filter(file => validatePath(file.path))).toEqual(
      validFiles
    )
  })

  it(`filters out files that start with dot`, () => {
    const validFiles = [{ path: `something/blah.js` }, { path: `test1.ts` }]

    const testFiles = validFiles.concat([
      { path: `.eslintrc` },
      { path: `something/.eslintrc` },
      { path: `something/.eslintrc.js` },
      { path: `.markdownlint.json` },
      { path: `something/.markdownlint.json` },
    ])

    expect(testFiles.filter(file => validatePath(file.path))).toEqual(
      validFiles
    )
  })

  it(`filters out json and yaml files`, () => {
    const validFiles = [{ path: `somefile.js` }, { path: `something/blah.js` }]

    const testFiles = validFiles.concat([
      { path: `something/otherConfig.yml` },
      { path: `config.yaml` },
      { path: `somefile.json` },
      { path: `dir1/file.json` },
      { path: `dir1/dir2/file.json` },
    ])

    expect(testFiles.filter(file => validatePath(file.path))).toEqual(
      validFiles
    )
  })

  it(`filters out files that start with template-*`, () => {
    const validFiles = [{ path: `something/blah.js` }, { path: `file1.js` }]

    const testFiles = validFiles.concat([
      { path: `template-cool-page-type.js` },
    ])

    expect(testFiles.filter(file => validatePath(file.path))).toEqual(
      validFiles
    )
  })

  it(`filters out files that have TypeScript declaration extensions`, () => {
    const validFiles = [
      { path: `something/foo.ts` },
      { path: `something/bar.tsx` },
    ]

    const testFiles = validFiles.concat([
      { path: `something/declaration-file.d.ts` },
      { path: `something-else/other-declaration-file.d.tsx` },
    ])

    expect(testFiles.filter(file => validatePath(file.path))).toEqual(
      validFiles
    )
  })

  it(`filters out test files`, () => {
    const validFiles = [{ path: `page.js` }, { path: `page.jsx` }]

    const testFiles = validFiles.concat([
      { path: `src/pages/__tests__/something.test.js` },
      { path: `src/pages/__tests__/something.test.tsx` },
      { path: `src/pages/__tests__/something.js` },
      { path: `src/pages/__tests__/nested-directory/something.js` },
      { path: `src/pages/foo.spec.js` },
      { path: `src/pages/foo.spec.tsx` },
      { path: `src/pages/bar.test.js` },
      { path: `src/pages/bar.test.tsx` },
      { path: `src\\pages\\bar.test.js` },
      { path: `src\\pages\\__tests__\\nested-directory\\something.js` },
    ])

    expect(testFiles.filter(file => validatePath(file.path))).toEqual(
      validFiles
    )
  })

  describe(`create-path`, () => {
    it(`should create unix paths`, () => {
      const basePath = `/a/`
      const paths = [`/a/b/c/de`, `/a/bee`, `/a/b/d/c/`]

      expect(paths.map(p => createPath(basePath, p))).toMatchSnapshot()
    })

    it(`should deal with windows paths`, () => {
      const basePath = `D:/Projets/gatsby-starter/src/pages`
      const paths = [
        `D:\\Projets\\gatsby-starter\\src\\pages\\404.tsx`,
        `D:\\Projets\\gatsby-starter\\src\\pages\\index.tsx`,
        `D:\\Projets\\gatsby-starter\\src\\pages\\blog.tsx`,
      ]

      expect(paths.map(p => createPath(basePath, p))).toMatchSnapshot()
    })
  })
})

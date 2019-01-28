const validatePath = require(`../validate-path`)
const createPath = require(`../create-path`)
const ignorePath = require(`../ignore-path`)

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

  describe(`ignore-path`, () => {
    it(`does not filter files without an ignore object`, () => {
      const ignoreFiles = [
        { path: `blog.js` },
        { path: `post.tsx` },
        { path: `file.example.jsx` },
        { path: `file.example.tsx` },
        { path: `dir/file.example.js` },
      ]

      const testFiles = ignoreFiles.concat([
        // blog or post in sub directory, other pages in top directory
        { path: `dir/blog.jsx` },
        { path: `dir/post.ts` },
        { path: `other.js` },
        // example page or directory without the preprended extension
        { path: `example.js` },
        { path: `example/file.tsx` },
        { path: `dir/example.jsx` },
      ])

      expect(testFiles.filter(file => ignorePath(file.path, null))).toEqual([])
    })

    it(`does not filter files without any ignore patterns`, () => {
      const ignoreFiles = [
        { path: `blog.js` },
        { path: `post.tsx` },
        { path: `file.example.jsx` },
        { path: `file.example.tsx` },
        { path: `dir/file.example.js` },
      ]

      const testFiles = ignoreFiles.concat([
        // blog or post in sub directory, other pages in top directory
        { path: `dir/blog.jsx` },
        { path: `dir/post.ts` },
        { path: `other.js` },
        // example page or directory without the preprended extension
        { path: `example.js` },
        { path: `example/file.tsx` },
        { path: `dir/example.jsx` },
      ])

      expect(testFiles.filter(file => ignorePath(file.path, {}))).toEqual([])
    })

    it(`filters out files matching ignore patterns`, () => {
      const patterns = [
        // files named 'blog' or 'post' in top of pages directory
        `(blog|post).(js|ts)?(x)*`,
        // any files with .example prepended to the js(x)/ts(x) extension
        `**/*.example.(js|ts)?(x)`,
      ]

      const ignoreFiles = [
        { path: `blog.js` },
        { path: `post.tsx` },
        { path: `file.example.jsx` },
        { path: `file.example.tsx` },
        { path: `dir/file.example.js` },
      ]

      const testFiles = ignoreFiles.concat([
        // blog or post in sub directory, other pages in top directory
        { path: `dir/blog.jsx` },
        { path: `dir/post.ts` },
        { path: `other.js` },
        // example page or directory without the preprended extension
        { path: `example.js` },
        { path: `example/file.tsx` },
        { path: `dir/example.jsx` },
      ])

      expect(
        testFiles.filter(file => ignorePath(file.path, { patterns }))
      ).toEqual(ignoreFiles)
    })

    it(`filters out files matching ignore patterns w/ options.nocase`, () => {
      const patterns = [
        // files named 'blog' or 'post' in top of pages directory
        `(blog|post).(js|ts)?(x)*`,
        // any files with .example prepended to the js(x)/ts(x) extension
        `**/*.example.(js|ts)?(x)`,
      ]

      // https://www.npmjs.com/package/micromatch#optionsnocase
      const options = { nocase: true }

      const ignoreFiles = [
        { path: `blog.js` },
        { path: `POST.tsx` },
        { path: `file.example.jsx` },
        { path: `file.EXAMPLE.tsx` },
        { path: `dir/file.example.js` },
        { path: `dir/file.EXAMPLE.js` },
      ]

      const testFiles = ignoreFiles.concat([
        // blog or post in sub directory, other pages in top directory
        { path: `dir/blog.jsx` },
        { path: `dir/post.ts` },
        { path: `other.js` },
        // example page or directory without the preprended extension
        { path: `example.js` },
        { path: `example/file.tsx` },
        { path: `dir/example.jsx` },
      ])

      expect(
        testFiles.filter(file => ignorePath(file.path, { patterns, options }))
      ).toEqual(ignoreFiles)
    })

    it(`filters out files matching ignore patterns as shorthand array`, () => {
      const patterns = [
        // files named 'blog' or 'post' in top of pages directory
        `(blog|post).(js|ts)?(x)*`,
        // any files with .example prepended to the js(x)/ts(x) extension
        `**/*.example.(js|ts)?(x)`,
      ]

      const ignoreFiles = [
        { path: `blog.js` },
        { path: `post.tsx` },
        { path: `file.example.jsx` },
        { path: `file.example.tsx` },
        { path: `dir/file.example.js` },
      ]

      const testFiles = ignoreFiles.concat([
        // blog or post in sub directory, other pages in top directory
        { path: `dir/blog.jsx` },
        { path: `dir/post.ts` },
        { path: `other.js` },
        // example page or directory without the preprended extension
        { path: `example.js` },
        { path: `example/file.tsx` },
        { path: `dir/example.jsx` },
      ])

      expect(testFiles.filter(file => ignorePath(file.path, patterns))).toEqual(
        ignoreFiles
      )
    })

    it(`filters out files matching ignore pattern as shorthand string`, () => {
      const pattern = `(blog|post).(js|ts)?(x)*`
      // files named 'blog' or 'post' in top of pages directory

      const ignoreFiles = [{ path: `blog.js` }, { path: `post.tsx` }]

      const testFiles = ignoreFiles.concat([
        // blog or post in sub directory, other pages in top directory
        { path: `dir/blog.jsx` },
        { path: `dir/post.ts` },
        { path: `other.js` },
      ])

      expect(testFiles.filter(file => ignorePath(file.path, pattern))).toEqual(
        ignoreFiles
      )
    })
  })
})

import fse from "fs-extra"
import { vol } from "memfs"
import {
  generatePrettyUrlFilePath,
  createStaticAssetsPathHandler,
  normalizeDynamicRoutePath,
} from "../pretty-urls"

jest.mock(`fs`, () => jest.requireActual(`memfs`).fs)

describe(`generatePrettyUrlFilePath`, () => {
  it(`/`, () => {
    expect(generatePrettyUrlFilePath(`/`)).toEqual(`/index.html`)
  })

  it(`/foo`, () => {
    expect(generatePrettyUrlFilePath(`/foo`)).toEqual(`/foo.html`)
  })

  it(`/foo/`, () => {
    expect(generatePrettyUrlFilePath(`/foo/`)).toEqual(`/foo/index.html`)
  })
})

describe(`normalizeRoutePath`, () => {
  it(`static path return path as-is`, () => {
    expect(normalizeDynamicRoutePath(`/foo/`)).toEqual(`/foo/`)
  })

  it(`replaces ':param: with [param]`, () => {
    expect(normalizeDynamicRoutePath(`/foo/:param/bar/`)).toEqual(
      `/foo/[param]/bar/`
    )
  })

  it(`replaces '*' with [...]`, () => {
    expect(normalizeDynamicRoutePath(`/foo/*`)).toEqual(`/foo/[...]`)
  })

  it(`replaces '*named' with [...named]`, () => {
    expect(normalizeDynamicRoutePath(`/foo/*named`)).toEqual(`/foo/[...named]`)
  })
})

describe(`createStaticAssetsPathHandler`, () => {
  beforeEach(() => {
    vol.reset()
  })

  it(`no-op if filepath is already coorect for given route`, async () => {
    const copySpy = jest.spyOn(fse, `copy`)
    const moveSpy = jest.spyOn(fse, `move`)

    vol.fromJSON(
      {
        "public/index.html": `index`,
        "public/_gatsby/slices/slice-1.html": `slice`,
        "public/index.css": `body {}`,
      },
      process.cwd()
    )

    const { ensureStaticAssetPath, fileMovingDone } =
      createStaticAssetsPathHandler()

    ensureStaticAssetPath(`public/index.html`, `/`)
    ensureStaticAssetPath(`public/index.css`, `/index.css`)
    ensureStaticAssetPath(
      `public/_gatsby/slices/slice-1.html`,
      `/_gatsby/slices/slice-1.html`
    )

    await fileMovingDone()

    expect(moveSpy).not.toBeCalled()
    expect(copySpy).not.toBeCalled()
  })

  describe(`moves or copies file if filepath is incorrect for given route`, () => {
    it(`removes trailing slash`, async () => {
      vol.fromJSON({ "public/foo/index.html": `foo` }, process.cwd())

      const { ensureStaticAssetPath, fileMovingDone } =
        createStaticAssetsPathHandler()

      expect(vol.existsSync(`public/foo/index.html`)).toEqual(true)
      expect(vol.existsSync(`public/foo.html`)).toEqual(false)

      ensureStaticAssetPath(`public/foo/index.html`, `/foo`)

      await fileMovingDone()

      expect(vol.existsSync(`public/foo/index.html`)).toEqual(false)
      expect(vol.existsSync(`public/foo.html`)).toEqual(true)
    })

    it(`adds path prefix`, async () => {
      vol.fromJSON({ "public/foo/index.html": `foo` }, process.cwd())

      const { ensureStaticAssetPath, fileMovingDone } =
        createStaticAssetsPathHandler()

      expect(vol.existsSync(`public/foo/index.html`)).toEqual(true)
      expect(vol.existsSync(`public/prefix/foo/index.html`)).toEqual(false)

      ensureStaticAssetPath(`public/foo/index.html`, `/prefix/foo/`)

      await fileMovingDone()

      expect(vol.existsSync(`public/foo/index.html`)).toEqual(false)
      expect(vol.existsSync(`public/prefix/foo/index.html`)).toEqual(true)
    })

    it(`adds path prefix and removes trailing slash`, async () => {
      vol.fromJSON({ "public/foo/index.html": `foo` }, process.cwd())

      const { ensureStaticAssetPath, fileMovingDone } =
        createStaticAssetsPathHandler()

      expect(vol.existsSync(`public/foo/index.html`)).toEqual(true)
      expect(vol.existsSync(`public/prefix/foo.html`)).toEqual(false)

      ensureStaticAssetPath(`public/foo/index.html`, `/prefix/foo`)

      await fileMovingDone()

      expect(vol.existsSync(`public/foo/index.html`)).toEqual(false)
      expect(vol.existsSync(`public/prefix/foo.html`)).toEqual(true)
    })

    it(`handles non html assets for path prefix`, async () => {
      vol.fromJSON({ "public/index.css": `body {}` }, process.cwd())

      const { ensureStaticAssetPath, fileMovingDone } =
        createStaticAssetsPathHandler()

      expect(vol.existsSync(`public/index.css`)).toEqual(true)
      expect(vol.existsSync(`public/prefix/index.css`)).toEqual(false)

      ensureStaticAssetPath(`public/index.css`, `/prefix/index.css`)

      await fileMovingDone()

      expect(vol.existsSync(`public/index.css`)).toEqual(false)
      expect(vol.existsSync(`public/prefix/index.css`)).toEqual(true)
    })

    it(`handles dynamic param paths syntax (is not using reserved characters for file paths)`, async () => {
      vol.fromJSON({ "public/[param]/index.html": `:param` }, process.cwd())

      const { ensureStaticAssetPath, fileMovingDone } =
        createStaticAssetsPathHandler()

      expect(vol.existsSync(`public/[param]/index.html`)).toEqual(true)
      expect(vol.existsSync(`public/foo/[param]/index.html`)).toEqual(false)

      ensureStaticAssetPath(`public/[param]/index.html`, `/foo/:param/`)

      await fileMovingDone()

      expect(vol.existsSync(`public/foo/[param]/index.html`)).toEqual(true)
      expect(vol.existsSync(`public/[param]/index.html`)).toEqual(false)
    })

    it(`handles dynamic named wildcard paths syntax (is not using reserved characters for file paths)`, async () => {
      vol.fromJSON(
        { "public/[...wildcard]/index.html": `*wildcard` },
        process.cwd()
      )

      const { ensureStaticAssetPath, fileMovingDone } =
        createStaticAssetsPathHandler()

      expect(vol.existsSync(`public/[...wildcard]/index.html`)).toEqual(true)
      expect(vol.existsSync(`public/foo/[...wildcard].html`)).toEqual(false)

      ensureStaticAssetPath(`public/[...wildcard]/index.html`, `/foo/*wildcard`)

      await fileMovingDone()

      expect(vol.existsSync(`public/foo/[...wildcard].html`)).toEqual(true)
      expect(vol.existsSync(`public/[...wildcard]/index.html`)).toEqual(false)
    })

    it(`handles dynamic unnamed wildcard paths syntax (is not using reserved characters for file paths)`, async () => {
      vol.fromJSON({ "public/[...]/index.html": `*` }, process.cwd())

      const { ensureStaticAssetPath, fileMovingDone } =
        createStaticAssetsPathHandler()

      expect(vol.existsSync(`public/[...]/index.html`)).toEqual(true)
      expect(vol.existsSync(`public/foo/[...].html`)).toEqual(false)

      ensureStaticAssetPath(`public/[...]/index.html`, `/foo/*`)

      await fileMovingDone()

      expect(vol.existsSync(`public/foo/[...].html`)).toEqual(true)
      expect(vol.existsSync(`public/[...]/index.html`)).toEqual(false)
    })

    it(`keeps 404.html in root`, async () => {
      vol.fromJSON({ "public/404.html": `404` }, process.cwd())

      const { ensureStaticAssetPath, fileMovingDone } =
        createStaticAssetsPathHandler()

      expect(vol.existsSync(`public/404.html`)).toEqual(true)
      expect(vol.existsSync(`public/foo/404.html`)).toEqual(false)

      ensureStaticAssetPath(`public/404.html`, `/foo/404.html`)

      await fileMovingDone()

      expect(vol.existsSync(`public/404.html`)).toEqual(true)
      // 404 page is coped so it exists in both locations
      expect(vol.existsSync(`public/foo/404.html`)).toEqual(true)
    })

    it(`keeps 500.html in root`, async () => {
      vol.fromJSON({ "public/500.html": `500` }, process.cwd())

      const { ensureStaticAssetPath, fileMovingDone } =
        createStaticAssetsPathHandler()

      expect(vol.existsSync(`public/500.html`)).toEqual(true)
      expect(vol.existsSync(`public/foo/500.html`)).toEqual(false)

      ensureStaticAssetPath(`public/500.html`, `/foo/500.html`)

      await fileMovingDone()

      expect(vol.existsSync(`public/500.html`)).toEqual(true)
      // 500 page is coped so it exists in both locations
      expect(vol.existsSync(`public/foo/500.html`)).toEqual(true)
    })
  })
})

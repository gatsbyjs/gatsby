import { murmurhash } from "gatsby-core-utils/murmurhash"
import { generateComponentChunkName } from "../js-chunk-names"

const mockedProgramDirectory = `/home/username/private/mywebsite`
jest.mock(`../../redux`, () => {
  return {
    store: {
      getState: (): unknown => {
        return {
          program: {
            directory: mockedProgramDirectory,
          },
        }
      },
    },
  }
})

jest.mock(`gatsby-core-utils/murmurhash`)

describe(`js-chunk-names`, () => {
  beforeEach(() => {
    murmurhash.mockReturnValue(`1234567890`)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it(`supports dynamic routes`, () => {
    expect(
      generateComponentChunkName(
        `${mockedProgramDirectory}/src/pages/user/[id].js`
      )
    ).toEqual(`component---src-pages-user-[id]-js`)

    expect(
      generateComponentChunkName(
        `${mockedProgramDirectory}/src/pages/user/[id]/[name].js`
      )
    ).toEqual(`component---src-pages-user-[id]-[name]-js`)
  })

  it(`supports collection routes`, () => {
    expect(
      generateComponentChunkName(
        `${mockedProgramDirectory}/src/pages/user/{id}.js`
      )
    ).toEqual(`component---src-pages-user-{id}-js`)

    expect(
      generateComponentChunkName(
        `${mockedProgramDirectory}/src/pages/user/{id}/{name}.js`
      )
    ).toEqual(`component---src-pages-user-{id}-{name}-js`)
  })

  it(`it ensures chunk names can not exceed 255 characters`, () => {
    const shortenedChunkName = generateComponentChunkName(
      `${mockedProgramDirectory}/src/content/lorem-ipsum-dolor-sit-amet-consectetur-adipiscing-elit-sed-non-ex-libero-praesent-ac-neque-id-ex-vehicula-imperdiet-eget-et-dolor-fusce-cursus-neque-in-ipsum-varius-dictum-sed-ac-lectus-faucibus-lobortis-eros-a-lacinia-leo-pellentesque-convallis-volutpat.mdx`
    )
    expect(`${shortenedChunkName}.js.map`.length).toBeLessThan(255)
    expect(shortenedChunkName).toEqual(
      `component---1234567890-ortis-eros-a-lacinia-leo-pellentesque-convallis-volutpat-mdx`
    )
  })

  describe(`__contentFilePath`, () => {
    it(`hides absolute paths in __contentFilePath (simple, just __contentFilePath query param)`, () => {
      const shortenedChunkName = generateComponentChunkName(
        `${mockedProgramDirectory}/src/components/page.tsx?__contentFilePath=${mockedProgramDirectory}/src/pages/about.md`
      )

      expect(shortenedChunkName).toMatchInlineSnapshot(
        `"component---src-components-page-tsx-content-file-path-src-pages-about-md"`
      )
      // ensure we don't leak absolute path to where site is located in fs
      expect(shortenedChunkName).not.toMatch(`private`)
    })

    it(`hides absolute paths in __contentFilePath (with additional query params)`, () => {
      const shortenedChunkName = generateComponentChunkName(
        `${mockedProgramDirectory}/src/components/page.tsx?__contentFilePath=${mockedProgramDirectory}/src/pages/about.md&foo=bar`
      )

      expect(shortenedChunkName).toMatchInlineSnapshot(
        `"component---src-components-page-tsx-content-file-path-src-pages-about-md-foo-bar"`
      )
      // ensure we don't leak absolute path to where site is located in fs
      expect(shortenedChunkName).not.toMatch(`private`)
    })
  })
})

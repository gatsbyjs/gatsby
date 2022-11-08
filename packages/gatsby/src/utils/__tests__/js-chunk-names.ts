import { murmurhash } from "gatsby-core-utils/murmurhash"
import { generateComponentChunkName } from "../js-chunk-names"

jest.mock(`../../redux`, () => {
  return {
    store: {
      getState: (): unknown => {
        return {
          program: ``,
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
    expect(generateComponentChunkName(`/src/pages/user/[id].js`)).toEqual(
      `component---src-pages-user-[id]-js`
    )

    expect(
      generateComponentChunkName(`/src/pages/user/[id]/[name].js`)
    ).toEqual(`component---src-pages-user-[id]-[name]-js`)
  })

  it(`supports collection routes`, () => {
    expect(generateComponentChunkName(`/src/pages/user/{id}.js`)).toEqual(
      `component---src-pages-user-{id}-js`
    )

    expect(
      generateComponentChunkName(`/src/pages/user/{id}/{name}.js`)
    ).toEqual(`component---src-pages-user-{id}-{name}-js`)
  })

  it(`it ensures chunk names can not exceed 255 characters`, () => {
    const shortenedChunkName = generateComponentChunkName(
      `/src/content/lorem-ipsum-dolor-sit-amet-consectetur-adipiscing-elit-sed-non-ex-libero-praesent-ac-neque-id-ex-vehicula-imperdiet-eget-et-dolor-fusce-cursus-neque-in-ipsum-varius-dictum-sed-ac-lectus-faucibus-lobortis-eros-a-lacinia-leo-pellentesque-convallis-volutpat.mdx`
    )
    expect(`${shortenedChunkName}.js.map`.length).toBeLessThan(255)
    expect(shortenedChunkName).toEqual(
      `component---1234567890-ortis-eros-a-lacinia-leo-pellentesque-convallis-volutpat-mdx`
    )
  })
})

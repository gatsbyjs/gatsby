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

describe(`js-chunk-names`, () => {
  it(`supports dynamic routes`, () => {
    expect(generateComponentChunkName(`/src/pages/user/[id].js`)).toEqual(
      `component---3845912056-src-pages-user-[id]-js`
    )

    expect(
      generateComponentChunkName(`/src/pages/user/[id]/[name].js`)
    ).toEqual(`component---1572610615-src-pages-user-[id]-[name]-js`)
  })

  it(`supports collection routes`, () => {
    expect(generateComponentChunkName(`/src/pages/user/{id}.js`)).toEqual(
      `component---3475764800-src-pages-user-{id}-js`
    )

    expect(
      generateComponentChunkName(`/src/pages/user/{id}/{name}.js`)
    ).toEqual(`component---2365858180-src-pages-user-{id}-{name}-js`)
  })

  it(`it ensures chunk names can not exceed 255 characters`, () => {
    const shortenedChunkName = generateComponentChunkName(
      `/src/content/lorem-ipsum-dolor-sit-amet-consectetur-adipiscing-elit-sed-non-ex-libero-praesent-ac-neque-id-ex-vehicula-imperdiet-eget-et-dolor-fusce-cursus-neque-in-ipsum-varius-dictum-sed-ac-lectus-faucibus-lobortis-eros-a-lacinia-leo-pellentesque-convallis-volutpat.mdx`
    )
    expect(`${shortenedChunkName}.js.map`.length).toBeLessThan(255)
    expect(shortenedChunkName).toEqual(
      `component---2271333819-ortis-eros-a-lacinia-leo-pellentesque-convallis-volutpat-mdx`
    )
  })

  it(`it ensures chunk names can not exceed 255 characters`, () => {
    const shortenedChunkName = generateComponentChunkName(
      `/src/content/lorem-ipsum-dolor-sit-amet-consectetur-adipiscing-elit-sed-non-ex-libero-praesent-ac-neque-id-ex-vehicula-imperdiet-eget-et-dolor-fusce-cursus-neque-in-ipsum-varius-dictum-sed-ac-lectus-faucibus-lobortis-eros-a-lacinia-leo-pellentesque-convallis-volutpat.mdx`
    )
    expect(`${shortenedChunkName}.js.map`.length).toBe(255)
    expect(shortenedChunkName).toEqual(
      `component---src-content-lorem-ipsum-dolor-sit-amet-consectetur-adipiscing-elit-sed-non-ex-libero-praesent-ac-neque-id-ex-vehicula-imperdiet-eget-et-dolor-fusce-cursus-neque-in-ipsum-varius-dictum-sed-ac-lect-k-uksd-fy-2-l-ktc-obj-ckz-cn-1-n-dgn-4-o`
    )
  })
})

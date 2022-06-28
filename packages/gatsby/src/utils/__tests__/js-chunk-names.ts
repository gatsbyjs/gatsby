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

  it(`it shortens to long names`, () => {
    expect(
      generateComponentChunkName(
        `/src/content/lorem-ipsum-dolor-sit-amet-consectetur-adipiscing-elit-sed-non-ex-libero-praesent-ac-neque-id-ex-vehicula-imperdiet-eget-et-dolor-fusce-cursus-neque-in-ipsum-varius-dictum-sed-ac-lectus-faucibus-lobortis-eros-a-lacinia-leo-pellentesque-convallis-volutpat.mdx`
      )
    ).toEqual(
      `component---src-content-lorem-ipsum-dolor-sit-amet-consectetur-adipiscing-elit-sed-non-ex-libero-praesent-ac-neque-id-ex-vehicula-imperdiet-eget-et-dolor-fusce-cursus-neque-in-ipsum-varius-dictum-sed-ac-lectus-fau-k-uksd-fy-2-l-ktc-obj-ckz-cn-1-n-dgn-4-o`
    )
  })
})

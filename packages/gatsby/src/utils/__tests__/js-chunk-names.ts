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
})

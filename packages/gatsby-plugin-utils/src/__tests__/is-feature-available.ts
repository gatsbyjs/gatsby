import { hasFeature } from "../is-feature-available"
import apis from "gatsby/apis.json"

jest.mock(`gatsby/apis.json`, () => {
  return {}
})

describe(`hasFeature`, () => {
  it(`should return true if gatsby has the feature`, () => {
    apis.features = [`imageService`]
    expect(hasFeature(`imageService`)).toBe(true)
  })
  it(`should return false if the feature has a typo`, () => {
    apis.features = [`imageService`]
    expect(hasFeature(`imageServices`)).toBe(false)
  })

  it(`should return false if gatsby doesn't have the feature`, () => {
    apis.features = []
    expect(hasFeature(`imageService`)).toBe(false)
  })

  it(`should return false if gatsby doesn't support features section yet`, () => {
    // @ts-ignore - we want to test old versions too
    delete apis.features
    expect(hasFeature(`imageService`)).toBe(false)
  })
})

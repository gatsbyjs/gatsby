import { featuresReducer } from "../reducers/features"

import { actions } from "../actions"

describe(`Features actions`, () => {
  it(`should allow us to enable a feature`, () => {
    expect(featuresReducer({}, actions.setFeatureEnabled(`foo`, true)))
      .toMatchInlineSnapshot(`
      Object {
        "foo": true,
      }
    `)
  })

  it(`should allow us to disable a feature`, () => {
    expect(featuresReducer({}, actions.setFeatureEnabled(`foo`, false)))
      .toMatchInlineSnapshot(`
      Object {
        "foo": false,
      }
    `)
  })

  // TODO enable when featuers are enabled
  it.skip(`should not be able to toggle a feature if another plugin already changed it`, () => {
    const state = featuresReducer(
      undefined,
      actions.setFeatureEnabled(`image-service`, true)
    )
    expect(
      featuresReducer(state, actions.setFeatureEnabled(`image-service`, false))
    ).toEqual(
      expect.objectContaining({
        "image-service": true,
      })
    )
  })
})

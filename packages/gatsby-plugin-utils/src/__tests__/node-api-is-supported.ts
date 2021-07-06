import { isGatsbyNodeLifecycleSupported } from "../node-api-is-supported"

describe(`isGatsbyNodeLifecycleSupported`, () => {
  it(`returns true for supported API (createSchemaCustomization)`, () => {
    expect(isGatsbyNodeLifecycleSupported(`createSchemaCustomization`)).toEqual(
      true
    )
  })

  it(`returns false for unsupported API (thisIsNotSupported)`, () => {
    expect(isGatsbyNodeLifecycleSupported(`thisIsNotSupported`)).toEqual(false)
  })
})

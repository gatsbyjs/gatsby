import { normalizeProps } from "../babel-helpers"

describe(`static-image babel parser`, () => {
  it(`normalises props`, () => {
    const input = {
      formats: [`webP`, `JPG`, `png`],
      placeholder: `DOMINANT_COLOR`,
      layout: `FLUID`,
    }
    expect(normalizeProps(input)).toEqual({
      formats: [`webp`, `jpg`, `png`],
      layout: `fluid`,
      placeholder: `dominantColor`,
    })
  })
})

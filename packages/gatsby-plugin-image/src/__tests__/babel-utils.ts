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

  it(`handles tracedSvg`, () => {
    expect(
      normalizeProps({
        placeholder: `TRACED_SVG`,
      })
    ).toEqual({
      placeholder: `tracedSVG`,
    })

    expect(
      normalizeProps({
        placeholder: `tracedSVG`,
      })
    ).toEqual({
      placeholder: `tracedSVG`,
    })

    expect(
      normalizeProps({
        placeholder: `tracedSvg`,
      })
    ).toEqual({
      placeholder: `tracedSVG`,
    })
  })
})

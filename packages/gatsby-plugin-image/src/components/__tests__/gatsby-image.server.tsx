/**
 * @jest-environment jsdom
 */

import React from "react"
import { render, screen } from "@testing-library/react"
import { GatsbyImage } from "../gatsby-image.server"
import { IGatsbyImageData } from "../gatsby-image.browser"
import { SourceProps } from "../picture"

// Prevents terser for bailing because we're not in a babel plugin
jest.mock(
  `../../../macros/terser.macro`,
  () =>
    (strs): string =>
      strs.join(``)
)

describe(`GatsbyImage server`, () => {
  beforeEach(() => {
    console.warn = jest.fn()
    global.SERVER = true
    global.GATSBY___IMAGE = true
  })

  afterEach(() => {
    jest.clearAllMocks()
    global.SERVER = false
    global.GATSBY___IMAGE = false
  })

  it(`shows nothing when the image props is not passed`, () => {
    // Allows to get rid of typescript error when not passing image
    // This is helpful for user using JavaScript and not getting advent of
    // TS types
    const GatsbyImageAny = GatsbyImage as React.FC
    const { container } = render(<GatsbyImageAny />)

    // Verifying implementation details but it's for the UX, acceptable tradeoffs
    expect(console.warn).toBeCalledWith(
      `[gatsby-plugin-image] Missing image prop`
    )
    expect(container.firstChild).toBeNull()
  })

  describe(`style verifications`, () => {
    it(`has a valid className for fullWidth layout`, () => {
      const layout = `fullWidth`

      const image: IGatsbyImageData = {
        width: 100,
        height: 100,
        layout,
        images: { sources: [] },
        placeholder: { sources: [] },
        sizes: `192x192`,
        backgroundColor: `red`,
      }

      render(
        <GatsbyImage image={image} alt="A fake image for testing purpose" />
      )

      const wrapper = document.querySelector(`[data-gatsby-image-wrapper=""]`)
      expect((wrapper as HTMLElement).className).toMatchInlineSnapshot(
        `"gatsby-image-wrapper"`
      )
    })

    it(`has a valid style attributes for fixed layout`, () => {
      const layout = `fixed`

      const image: IGatsbyImageData = {
        width: 100,
        height: 100,
        layout,
        images: { sources: [] },
        placeholder: { sources: [] },
        sizes: `192x192`,
        backgroundColor: `red`,
      }

      render(
        <GatsbyImage image={image} alt="A fake image for testing purpose" />
      )

      const wrapper = document.querySelector(`[data-gatsby-image-wrapper=""]`)
      expect((wrapper as HTMLElement).style).toMatchInlineSnapshot(`
        CSSStyleDeclaration {
          "0": "width",
          "1": "height",
          "_importants": Object {
            "height": undefined,
            "width": undefined,
          },
          "_length": 2,
          "_onChange": [Function],
          "_values": Object {
            "height": "100px",
            "width": "100px",
          },
        }
      `)
    })

    it(`has a valid className for constrained layout`, () => {
      const layout = `constrained`

      const image: IGatsbyImageData = {
        width: 100,
        height: 100,
        layout,
        images: { sources: [] },
        placeholder: { sources: [] },
        sizes: `192x192`,
        backgroundColor: `red`,
      }

      render(
        <GatsbyImage image={image} alt="A fake image for testing purpose" />
      )

      const wrapper = document.querySelector(`[data-gatsby-image-wrapper=""]`)
      expect((wrapper as HTMLElement).className).toMatchInlineSnapshot(
        `"gatsby-image-wrapper gatsby-image-wrapper-constrained"`
      )
    })
  })

  describe(`fallback verifications`, () => {
    it(`doesn't have an src or srcSet when fallback is not provided in images`, () => {
      // no fallback provided
      const images = {}

      const image: IGatsbyImageData = {
        width: 100,
        height: 100,
        layout: `constrained`,
        images,
        placeholder: { sources: [] },
        backgroundColor: `red`,
      }

      render(
        <GatsbyImage image={image} alt="A fake image for testing purpose" />
      )

      const img = screen.getByRole(`img`)
      expect(img).toMatchInlineSnapshot(`
        <img
          alt="A fake image for testing purpose"
          data-gatsby-image-ssr=""
          data-main-image=""
          decoding="async"
          loading="lazy"
          style="opacity: 0;"
        />
      `)
    })

    it(`has a valid src value when fallback is provided in images`, () => {
      const images = {
        fallback: { src: `some-src-fallback.jpg`, sizes: `192x192` },
      }

      const image: IGatsbyImageData = {
        width: 100,
        height: 100,
        layout: `constrained`,
        images,
        placeholder: { sources: [] },
        backgroundColor: `red`,
      }

      render(
        <GatsbyImage image={image} alt="A fake image for testing purpose" />
      )

      const img = screen.getByRole(`img`)
      expect(img).toMatchInlineSnapshot(`
        <img
          alt="A fake image for testing purpose"
          data-gatsby-image-ssr=""
          data-main-image=""
          data-src="some-src-fallback.jpg"
          decoding="async"
          loading="lazy"
          sizes="192x192"
          style="opacity: 0;"
        />
      `)
    })

    it(`has a valid srcSet value when provided in the fallback prop of images`, () => {
      const images = {
        fallback: {
          src: `some-src-fallback.jpg`,
          srcSet: `icon32px.png 32w,
icon64px.png 64w,
icon-retina.png 2x,
icon-ultra.png 3x,
icon.svg`,
          sizes: `192x192`,
        },
      }

      const image: IGatsbyImageData = {
        width: 100,
        height: 100,
        layout: `constrained`,
        images,
        placeholder: { sources: [] },
        backgroundColor: `red`,
      }

      render(
        <GatsbyImage image={image} alt="A fake image for testing purpose" />
      )

      const img = screen.getByRole(`img`)
      expect(img).toMatchInlineSnapshot(`
        <img
          alt="A fake image for testing purpose"
          data-gatsby-image-ssr=""
          data-main-image=""
          data-src="some-src-fallback.jpg"
          data-srcset="icon32px.png 32w,icon64px.png 64w,icon-retina.png 2x,icon-ultra.png 3x,icon.svg"
          decoding="async"
          loading="lazy"
          sizes="192x192"
          style="opacity: 0;"
        />
      `)
    })
  })

  describe(`sources verifications`, () => {
    it(`doesn't have an src or srcSet when sources is not provided in images`, () => {
      // no fallback provided
      const images = {}

      const image: IGatsbyImageData = {
        width: 100,
        height: 100,
        layout: `constrained`,
        images,
        placeholder: { sources: [] },
        backgroundColor: `red`,
      }

      render(
        <GatsbyImage image={image} alt="A fake image for testing purpose" />
      )

      const img = screen.getByRole(`img`)
      expect(img).toMatchInlineSnapshot(`
        <img
          alt="A fake image for testing purpose"
          data-gatsby-image-ssr=""
          data-main-image=""
          decoding="async"
          loading="lazy"
          style="opacity: 0;"
        />
      `)
    })

    it(`has valid sizes and srcSet when provided in the images`, () => {
      const sources: Array<SourceProps> = [
        {
          media: `some-media`,
          sizes: `192x192,56x56`,
          srcSet: `icon32px.png 32w,
icon64px.png 64w,
icon-retina.png 2x,
icon-ultra.png 3x,
icon.svg`,
        },
      ]

      const image: IGatsbyImageData = {
        width: 100,
        height: 100,
        layout: `constrained`,
        images: {
          sources,
          fallback: { src: `some-src-fallback.jpg`, sizes: `192x192` },
        },
        placeholder: { sources: [] },
        backgroundColor: `red`,
      }

      const { container } = render(
        <GatsbyImage image={image} alt="A fake image for testing purpose" />
      )

      const picture = container.querySelector(`picture`)

      expect(picture).toMatchInlineSnapshot(`
        <picture>
          <source
            data-srcset="icon32px.png 32w,icon64px.png 64w,icon-retina.png 2x,icon-ultra.png 3x,icon.svg"
            media="some-media"
            sizes="192x192"
          />
          <img
            alt="A fake image for testing purpose"
            data-gatsby-image-ssr=""
            data-main-image=""
            data-src="some-src-fallback.jpg"
            decoding="async"
            loading="lazy"
            sizes="192x192"
            style="opacity: 0;"
          />
        </picture>
      `)
    })
  })

  describe(`placeholder verifications`, () => {
    it(`has a placeholder in a div with valid styles for fullWidth layout`, () => {
      const image: IGatsbyImageData = {
        width: 100,
        height: 100,
        layout: `fullWidth`,
        images: {},
        placeholder: { sources: [] },
        backgroundColor: `red`,
      }

      const { container } = render(
        <GatsbyImage image={image} alt="A fake image for testing purpose" />
      )
      const placeholder = container.querySelector(`[data-placeholder-image=""]`)

      expect(placeholder).toMatchInlineSnapshot(`
        <div
          aria-hidden="true"
          data-placeholder-image=""
          sources=""
          style="opacity: 1; transition: opacity 500ms linear; background-color: red; position: absolute; top: 0px; left: 0px; bottom: 0px; right: 0px;"
        />
      `)
    })

    it(`has a placeholder in a div with valid styles for fixed layout`, () => {
      const image: IGatsbyImageData = {
        width: 100,
        height: 100,
        layout: `fixed`,
        images: {},
        placeholder: { sources: [] },
        backgroundColor: `red`,
      }

      const { container } = render(
        <GatsbyImage image={image} alt="A fake image for testing purpose" />
      )
      const placeholder = container.querySelector(`[data-placeholder-image=""]`)

      expect(placeholder).toMatchInlineSnapshot(`
        <div
          aria-hidden="true"
          data-placeholder-image=""
          sources=""
          style="opacity: 1; transition: opacity 500ms linear; background-color: red; width: 100px; height: 100px; position: relative;"
        />
      `)
    })

    it(`has a placeholder in a div with valid styles for constrained layout`, () => {
      const image: IGatsbyImageData = {
        width: 100,
        height: 100,
        layout: `constrained`,
        images: {},
        placeholder: { sources: [] },
        backgroundColor: `red`,
      }

      const { container } = render(
        <GatsbyImage image={image} alt="A fake image for testing purpose" />
      )
      const placeholder = container.querySelector(`[data-placeholder-image=""]`)

      expect(placeholder).toMatchInlineSnapshot(`
        <div
          aria-hidden="true"
          data-placeholder-image=""
          sources=""
          style="opacity: 1; transition: opacity 500ms linear; background-color: red; position: absolute; top: 0px; left: 0px; bottom: 0px; right: 0px;"
        />
      `)
    })
  })
})

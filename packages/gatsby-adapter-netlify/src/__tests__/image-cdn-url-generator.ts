import type { ImageCdnTransformArgs } from "gatsby"

import { generateImageUrl, generateImageArgs } from "../image-cdn-url-generator"

describe(`generateImageUrl`, () => {
  // pathPrefix is not used for images
  const pathPrefix = `/prefix`

  const source = {
    url: `https://example.com/image.jpg`,
    filename: `image.jpg`,
    mimeType: `image/jpeg`,
    internal: {
      contentDigest: `1234`,
    },
  }

  it(`should return an image based url`, () => {
    expect(
      generateImageUrl(
        source,
        {
          width: 100,
          height: 100,
          cropFocus: `top`,
          format: `webp`,
          quality: 80,
        },
        pathPrefix
      )
    ).toMatchInlineSnapshot(
      `"/.netlify/images?w=100&h=100&fit=cover&position=top&fm=webp&q=80&url=https%3A%2F%2Fexample.com%2Fimage.jpg&cd=1234"`
    )
  })

  it(`should handle special characters`, () => {
    const source = {
      url: `https://example.com/image-éà.jpg`,
      filename: `image-éà.jpg`,
      mimeType: `image/jpeg`,
      internal: {
        contentDigest: `1234`,
      },
    }

    expect(
      generateImageUrl(
        source,
        {
          width: 100,
          height: 100,
          cropFocus: `top`,
          format: `webp`,
          quality: 80,
        },
        pathPrefix
      )
    ).toMatchInlineSnapshot(
      `"/.netlify/images?w=100&h=100&fit=cover&position=top&fm=webp&q=80&url=https%3A%2F%2Fexample.com%2Fimage-%C3%A9%C3%A0.jpg&cd=1234"`
    )
  })

  it(`should handle spaces`, () => {
    const source = {
      url: `https://example.com/image test.jpg`,
      filename: `image test.jpg`,
      mimeType: `image/jpeg`,
      internal: {
        contentDigest: `1234`,
      },
    }

    expect(
      generateImageUrl(
        source,
        {
          width: 100,
          height: 100,
          cropFocus: `top`,
          format: `webp`,
          quality: 80,
        },
        pathPrefix
      )
    ).toMatchInlineSnapshot(
      `"/.netlify/images?w=100&h=100&fit=cover&position=top&fm=webp&q=80&url=https%3A%2F%2Fexample.com%2Fimage+test.jpg&cd=1234"`
    )
  })

  it(`should handle encoded urls`, () => {
    const source = {
      url: `https://example.com/image%20test.jpg`,
      filename: `image test.jpg`,
      mimeType: `image/jpeg`,
      internal: {
        contentDigest: `1234`,
      },
    }

    expect(
      generateImageUrl(
        source,
        {
          width: 100,
          height: 100,
          cropFocus: `top`,
          format: `webp`,
          quality: 80,
        },
        pathPrefix
      )
    ).toMatchInlineSnapshot(
      `"/.netlify/images?w=100&h=100&fit=cover&position=top&fm=webp&q=80&url=https%3A%2F%2Fexample.com%2Fimage%2520test.jpg&cd=1234"`
    )
  })

  it.each([
    [`width`, `w`, 100],
    [`height`, `h`, 50],
    [`cropFocus`, `position`, `center,right`],
    [`format`, `fm`, `webp`],
    [`quality`, `q`, 60],
  ] as Array<[keyof ImageCdnTransformArgs, string, ImageCdnTransformArgs[keyof ImageCdnTransformArgs]]>)(
    `should set %s in image args`,
    (key, queryKey, value) => {
      const url = new URL(
        // @ts-ignore remove typings
        `https://netlify.com${generateImageUrl(
          source,
          {
            format: `webp`,
            [key]: value,
          },
          pathPrefix
        )}`
      )

      expect(url.searchParams.get(queryKey)).toEqual(value.toString())
    }
  )
})

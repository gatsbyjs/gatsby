import {
  generateFileUrl,
  generateImageUrl,
  ImageCDNUrlKeys,
} from "../url-generator"

type ImageArgs = Parameters<typeof generateImageUrl>[1]

describe(`url-generator`, () => {
  describe(`generateFileUrl`, () => {
    it(`should return a file based url`, () => {
      const source = {
        url: `https://example.com/file.pdf`,
        filename: `file.pdf`,
      }

      expect(generateFileUrl(source)).toMatchInlineSnapshot(
        `"/_gatsby/file/9f2eba7a1dbc78363c52aeb0daec9031/file.pdf?u=https%3A%2F%2Fexample.com%2Ffile.pdf"`
      )
    })

    it(`should handle special characters`, () => {
      const source = {
        url: `https://example.com/file-éà.pdf`,
        filename: `file-éà.pdf`,
      }

      expect(generateFileUrl(source)).toMatchInlineSnapshot(
        `"/_gatsby/file/8802451220032a66565f179e89e00a83/file-%C3%A9%C3%A0.pdf?u=https%3A%2F%2Fexample.com%2Ffile-%C3%A9%C3%A0.pdf"`
      )
    })

    it(`should handle spaces`, () => {
      const source = {
        url: `https://example.com/file test.pdf`,
        filename: `file test.pdf`,
      }

      expect(generateFileUrl(source)).toMatchInlineSnapshot(
        `"/_gatsby/file/6e41758c045f4509e19938d738d2a23c/file%20test.pdf?u=https%3A%2F%2Fexample.com%2Ffile+test.pdf"`
      )
    })

    it(`should handle html encoded urls`, () => {
      const source = {
        url: `https://example.com/file%20test.pdf`,
        filename: `file test.pdf`,
      }

      expect(generateFileUrl(source)).toMatchInlineSnapshot(
        `"/_gatsby/file/799c0b15477311f5b8d9f635594671f2/file%20test.pdf?u=https%3A%2F%2Fexample.com%2Ffile%2520test.pdf"`
      )
    })
  })

  describe(`generateImageUrl`, () => {
    const source = {
      url: `https://example.com/image.jpg`,
      filename: `image.jpg`,
      mimeType: `image/jpeg`,
    }

    it(`should return an image based url`, () => {
      expect(
        generateImageUrl(source, {
          width: 100,
          height: 100,
          cropFocus: `top`,
          format: `webp`,
          quality: 80,
        })
      ).toMatchInlineSnapshot(
        `"/_gatsby/image/18867d45576d8283d6fabb82406789c8/a5d4237c29c15bd781f3586364b7e168/image.webp?u=https%3A%2F%2Fexample.com%2Fimage.jpg&a=w%3D100%26h%3D100%26fit%3Dcrop%26crop%3Dtop%26fm%3Dwebp%26q%3D80"`
      )
    })

    it(`should handle special characters`, () => {
      const source = {
        url: `https://example.com/image-éà.jpg`,
        filename: `image-éà.jpg`,
        mimeType: `image/jpeg`,
      }

      expect(
        generateImageUrl(source, {
          width: 100,
          height: 100,
          cropFocus: `top`,
          format: `webp`,
          quality: 80,
        })
      ).toMatchInlineSnapshot(
        `"/_gatsby/image/efe0766d673b5a1cb5070c77e019c3de/a5d4237c29c15bd781f3586364b7e168/image-%C3%A9%C3%A0.webp?u=https%3A%2F%2Fexample.com%2Fimage-%C3%A9%C3%A0.jpg&a=w%3D100%26h%3D100%26fit%3Dcrop%26crop%3Dtop%26fm%3Dwebp%26q%3D80"`
      )
    })

    it(`should handle spaces`, () => {
      const source = {
        url: `https://example.com/image test.jpg`,
        filename: `image test.jpg`,
        mimeType: `image/jpeg`,
      }

      expect(
        generateImageUrl(source, {
          width: 100,
          height: 100,
          cropFocus: `top`,
          format: `webp`,
          quality: 80,
        })
      ).toMatchInlineSnapshot(
        `"/_gatsby/image/4b2d785bb2f2b7d04e00cb15daeb1687/a5d4237c29c15bd781f3586364b7e168/image%20test.webp?u=https%3A%2F%2Fexample.com%2Fimage+test.jpg&a=w%3D100%26h%3D100%26fit%3Dcrop%26crop%3Dtop%26fm%3Dwebp%26q%3D80"`
      )
    })

    it(`should handle encoded urls`, () => {
      const source = {
        url: `https://example.com/image%20test.jpg`,
        filename: `image test.jpg`,
        mimeType: `image/jpeg`,
      }

      expect(
        generateImageUrl(source, {
          width: 100,
          height: 100,
          cropFocus: `top`,
          format: `webp`,
          quality: 80,
        })
      ).toMatchInlineSnapshot(
        `"/_gatsby/image/e204b74f97d4407c992c4c3a7c5c66c4/a5d4237c29c15bd781f3586364b7e168/image%20test.webp?u=https%3A%2F%2Fexample.com%2Fimage%2520test.jpg&a=w%3D100%26h%3D100%26fit%3Dcrop%26crop%3Dtop%26fm%3Dwebp%26q%3D80"`
      )
    })

    it.each([
      [`width`, `w`, 100],
      [`height`, `h`, 50],
      [`cropFocus`, `crop`, `center,right`],
      [`format`, `fm`, `webp`],
      [`quality`, `q`, 60],
    ] as Array<[keyof ImageArgs, string, ImageArgs[keyof ImageArgs]]>)(
      `should set %s in image args`,
      (key, queryKey, value) => {
        const url = new URL(
          // @ts-ignore remove typings
          `https://gatsbyjs.com${generateImageUrl(source, {
            format: `webp`,
            [key]: value,
          })}`
        )
        expect(url.searchParams.get(ImageCDNUrlKeys.ARGS)).toContain(
          `${queryKey}=${value}`
        )
      }
    )
  })
})

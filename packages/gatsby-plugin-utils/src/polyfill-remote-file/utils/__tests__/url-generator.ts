import crypto from "crypto"
import { Store } from "gatsby"
import url from "url"

import {
  generateFileUrl,
  generateImageUrl,
  ImageCDNUrlKeys,
} from "../url-generator"

type ImageArgs = Parameters<typeof generateImageUrl>[1]

describe(`url-generator`, () => {
  it(`should work with pathPrefix`, () => {
    const source = {
      url: `https://example.com/image.jpg`,
      filename: `image.jpg`,
      mimeType: `image/jpeg`,
      internal: {
        contentDigest: `1234`,
      },
    }

    const store = {
      getState: (): {
        program: { prefixPaths: boolean }
        config: { pathPrefix: string }
      } => {
        return {
          program: {
            prefixPaths: true,
          },
          config: {
            pathPrefix: `/prefix-test`,
          },
        }
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
        store as unknown as Store
      )
    ).toMatchInlineSnapshot(
      `"/prefix-test/_gatsby/image/18867d45576d8283d6fabb82406789c8/a5d4237c29c15bd781f3586364b7e168/image.webp?u=https%3A%2F%2Fexample.com%2Fimage.jpg&a=w%3D100%26h%3D100%26fit%3Dcrop%26crop%3Dtop%26fm%3Dwebp%26q%3D80&cd=1234"`
    )

    const fileSource = {
      url: `https://example.com/file.pdf`,
      filename: `file.pdf`,
      mimeType: `application/pdf`,
      internal: {
        contentDigest: `1234`,
      },
    }

    expect(
      generateFileUrl(fileSource, store as unknown as Store)
    ).toMatchInlineSnapshot(
      `"/prefix-test/_gatsby/file/9f2eba7a1dbc78363c52aeb0daec9031/file.pdf?u=https%3A%2F%2Fexample.com%2Ffile.pdf"`
    )
  })

  describe(`URL encryption`, () => {
    function decryptImageCdnUrl(
      key: string,
      iv: string,
      encryptedUrl: string
    ): { decryptedUrl: string; randomPadding: string } {
      const decipher = crypto.createDecipheriv(
        `aes-256-ctr`,
        Buffer.from(key, `hex`),
        Buffer.from(iv, `hex`)
      )
      const decrypted = decipher.update(Buffer.from(encryptedUrl, `hex`))
      const clearText = Buffer.concat([decrypted, decipher.final()]).toString()

      const [randomPadding, ...url] = clearText.split(`:`)

      return { decryptedUrl: url.join(`:`), randomPadding }
    }

    const fileUrlToEncrypt = `https://example.com/file.pdf`
    const imageUrlToEncrypt = `https://example.com/image.png`

    const imageNode = {
      url: imageUrlToEncrypt,
      mimeType: `image/png`,
      filename: `image.png`,
      internal: {
        contentDigest: `digest`,
      },
    }

    const resizeArgs = {
      width: 100,
      height: 100,
      format: `webp`,
      quality: 80,
    }

    const generateEncryptedUrlForType = (type: string): string => {
      const url = {
        file: generateFileUrl({
          url: fileUrlToEncrypt,
          filename: `file.pdf`,
          mimeType: `application/pdf`,
          internal: {
            contentDigest: `1234`,
          },
        }),
        image: generateImageUrl(imageNode, resizeArgs),
      }[type]

      if (!url) {
        throw new Error(`Unknown type: ${type}`)
      }

      return url
    }

    const getUnencryptedUrlForType = (type: string): string => {
      if (type === `file`) {
        return fileUrlToEncrypt
      } else if (type === `image`) {
        return imageUrlToEncrypt
      } else {
        throw new Error(`Unknown type: ${type}`)
      }
    }

    it.each([`file`, `image`])(
      `should return %s URL's untouched if encryption is not enabled`,
      type => {
        const unencryptedUrl = generateEncryptedUrlForType(type)

        const { eu, u } = url.parse(unencryptedUrl, true).query

        expect(eu).toBe(undefined)
        expect(u).toBeTruthy()

        expect(u).toBe(getUnencryptedUrlForType(type))
      }
    )

    it.each([`file`, `image`])(
      `should return %s URL's encrypted if encryption is enabled`,
      type => {
        const key = crypto.randomBytes(32).toString(`hex`)
        const iv = crypto.randomBytes(16).toString(`hex`)

        process.env.IMAGE_CDN_ENCRYPTION_SECRET_KEY = key
        process.env.IMAGE_CDN_ENCRYPTION_IV = iv

        const urlWithEncryptedEuParam = generateEncryptedUrlForType(type)

        expect(urlWithEncryptedEuParam).not.toContain(
          encodeURIComponent(getUnencryptedUrlForType(type))
        )

        const { eu: encryptedUrlParam, u: urlParam } = url.parse(
          urlWithEncryptedEuParam,
          true
        ).query

        expect(urlParam).toBeFalsy()
        expect(encryptedUrlParam).toBeTruthy()

        const { decryptedUrl, randomPadding } = decryptImageCdnUrl(
          key,
          iv,
          encryptedUrlParam as string
        )

        expect(decryptedUrl).toEqual(getUnencryptedUrlForType(type))
        expect(randomPadding.length).toBeGreaterThan(0)

        delete process.env.IMAGE_CDN_ENCRYPTION_SECRET_KEY
        delete process.env.IMAGE_CDN_ENCRYPTION_IV
      }
    )
  })

  describe(`generateFileUrl`, () => {
    it(`should return a file based url`, () => {
      const source = {
        url: `https://example.com/file.pdf`,
        filename: `file.pdf`,
        mimeType: `application/pdf`,
        internal: {
          contentDigest: `1234`,
        },
      }

      expect(generateFileUrl(source)).toMatchInlineSnapshot(
        `"/_gatsby/file/9f2eba7a1dbc78363c52aeb0daec9031/file.pdf?u=https%3A%2F%2Fexample.com%2Ffile.pdf"`
      )
    })

    it(`should handle special characters`, () => {
      const source = {
        url: `https://example.com/file-éà.pdf`,
        filename: `file-éà.pdf`,
        mimeType: `application/pdf`,
        internal: {
          contentDigest: `1234`,
        },
      }

      expect(generateFileUrl(source)).toMatchInlineSnapshot(
        `"/_gatsby/file/8802451220032a66565f179e89e00a83/file-%C3%A9%C3%A0.pdf?u=https%3A%2F%2Fexample.com%2Ffile-%C3%A9%C3%A0.pdf"`
      )
    })

    it(`should handle spaces`, () => {
      const source = {
        url: `https://example.com/file test.pdf`,
        filename: `file test.pdf`,
        mimeType: `application/pdf`,
        internal: {
          contentDigest: `1234`,
        },
      }

      expect(generateFileUrl(source)).toMatchInlineSnapshot(
        `"/_gatsby/file/6e41758c045f4509e19938d738d2a23c/file%20test.pdf?u=https%3A%2F%2Fexample.com%2Ffile+test.pdf"`
      )
    })

    it(`should handle html encoded urls`, () => {
      const source = {
        url: `https://example.com/file%20test.pdf`,
        filename: `file test.pdf`,
        mimeType: `application/pdf`,
        internal: {
          contentDigest: `1234`,
        },
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
      internal: {
        contentDigest: `1234`,
      },
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
        `"/_gatsby/image/18867d45576d8283d6fabb82406789c8/a5d4237c29c15bd781f3586364b7e168/image.webp?u=https%3A%2F%2Fexample.com%2Fimage.jpg&a=w%3D100%26h%3D100%26fit%3Dcrop%26crop%3Dtop%26fm%3Dwebp%26q%3D80&cd=1234"`
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
        generateImageUrl(source, {
          width: 100,
          height: 100,
          cropFocus: `top`,
          format: `webp`,
          quality: 80,
        })
      ).toMatchInlineSnapshot(
        `"/_gatsby/image/efe0766d673b5a1cb5070c77e019c3de/a5d4237c29c15bd781f3586364b7e168/image-%C3%A9%C3%A0.webp?u=https%3A%2F%2Fexample.com%2Fimage-%C3%A9%C3%A0.jpg&a=w%3D100%26h%3D100%26fit%3Dcrop%26crop%3Dtop%26fm%3Dwebp%26q%3D80&cd=1234"`
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
        generateImageUrl(source, {
          width: 100,
          height: 100,
          cropFocus: `top`,
          format: `webp`,
          quality: 80,
        })
      ).toMatchInlineSnapshot(
        `"/_gatsby/image/4b2d785bb2f2b7d04e00cb15daeb1687/a5d4237c29c15bd781f3586364b7e168/image%20test.webp?u=https%3A%2F%2Fexample.com%2Fimage+test.jpg&a=w%3D100%26h%3D100%26fit%3Dcrop%26crop%3Dtop%26fm%3Dwebp%26q%3D80&cd=1234"`
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
        generateImageUrl(source, {
          width: 100,
          height: 100,
          cropFocus: `top`,
          format: `webp`,
          quality: 80,
        })
      ).toMatchInlineSnapshot(
        `"/_gatsby/image/e204b74f97d4407c992c4c3a7c5c66c4/a5d4237c29c15bd781f3586364b7e168/image%20test.webp?u=https%3A%2F%2Fexample.com%2Fimage%2520test.jpg&a=w%3D100%26h%3D100%26fit%3Dcrop%26crop%3Dtop%26fm%3Dwebp%26q%3D80&cd=1234"`
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

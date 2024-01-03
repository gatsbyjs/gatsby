import { generateFileUrl } from "../file-cdn-url-generator"

describe(`generateFileUrl`, () => {
  describe(`image`, () => {
    // pathPrefix is not used for images
    const pathPrefix = `/prefix`

    it(`should return a file based url`, () => {
      const source = {
        url: `https://example.com/file.jpg`,
        filename: `file.jpg`,
        mimeType: `image/jpeg`,
        internal: {
          contentDigest: `1234`,
        },
      }

      expect(generateFileUrl(source, pathPrefix)).toMatchInlineSnapshot(
        `"/.netlify/images?url=https%3A%2F%2Fexample.com%2Ffile.jpg&cd=1234"`
      )
    })

    it(`should handle special characters`, () => {
      const source = {
        url: `https://example.com/file-éà.jpg`,
        filename: `file-éà.jpg`,
        mimeType: `image/jpeg`,
        internal: {
          contentDigest: `1234`,
        },
      }

      expect(generateFileUrl(source, pathPrefix)).toMatchInlineSnapshot(
        `"/.netlify/images?url=https%3A%2F%2Fexample.com%2Ffile-%C3%A9%C3%A0.jpg&cd=1234"`
      )
    })

    it(`should handle spaces`, () => {
      const source = {
        url: `https://example.com/file test.jpg`,
        filename: `file test.jpg`,
        mimeType: `image/jpeg`,
        internal: {
          contentDigest: `1234`,
        },
      }

      expect(generateFileUrl(source, pathPrefix)).toMatchInlineSnapshot(
        `"/.netlify/images?url=https%3A%2F%2Fexample.com%2Ffile+test.jpg&cd=1234"`
      )
    })

    it(`should handle html encoded urls`, () => {
      const source = {
        url: `https://example.com/file%20test.jpg`,
        filename: `file test.jpg`,
        mimeType: `image/jpeg`,
        internal: {
          contentDigest: `1234`,
        },
      }

      expect(generateFileUrl(source, pathPrefix)).toMatchInlineSnapshot(
        `"/.netlify/images?url=https%3A%2F%2Fexample.com%2Ffile%2520test.jpg&cd=1234"`
      )
    })
  })

  describe(`no image`, () => {
    describe(`no pathPrefix`, () => {
      const pathPrefix = ``

      it(`should return a file based url`, () => {
        const source = {
          url: `https://example.com/file.pdf`,
          filename: `file.pdf`,
          mimeType: `application/pdf`,
          internal: {
            contentDigest: `1234`,
          },
        }

        expect(generateFileUrl(source, pathPrefix)).toMatchInlineSnapshot(
          `"/_gatsby/file/9f2eba7a1dbc78363c52aeb0daec9031/file.pdf?url=https%3A%2F%2Fexample.com%2Ffile.pdf&cd=1234"`
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

        expect(generateFileUrl(source, pathPrefix)).toMatchInlineSnapshot(
          `"/_gatsby/file/8802451220032a66565f179e89e00a83/file-%C3%A9%C3%A0.pdf?url=https%3A%2F%2Fexample.com%2Ffile-%C3%A9%C3%A0.pdf&cd=1234"`
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

        expect(generateFileUrl(source, pathPrefix)).toMatchInlineSnapshot(
          `"/_gatsby/file/6e41758c045f4509e19938d738d2a23c/file%20test.pdf?url=https%3A%2F%2Fexample.com%2Ffile+test.pdf&cd=1234"`
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

        expect(generateFileUrl(source, pathPrefix)).toMatchInlineSnapshot(
          `"/_gatsby/file/799c0b15477311f5b8d9f635594671f2/file%20test.pdf?url=https%3A%2F%2Fexample.com%2Ffile%2520test.pdf&cd=1234"`
        )
      })
    })

    describe(`with pathPrefix`, () => {
      const pathPrefix = `/prefix`

      it(`should return a file based url`, () => {
        const source = {
          url: `https://example.com/file.pdf`,
          filename: `file.pdf`,
          mimeType: `application/pdf`,
          internal: {
            contentDigest: `1234`,
          },
        }

        expect(generateFileUrl(source, pathPrefix)).toMatchInlineSnapshot(
          `"/prefix/_gatsby/file/9f2eba7a1dbc78363c52aeb0daec9031/file.pdf?url=https%3A%2F%2Fexample.com%2Ffile.pdf&cd=1234"`
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

        expect(generateFileUrl(source, pathPrefix)).toMatchInlineSnapshot(
          `"/prefix/_gatsby/file/8802451220032a66565f179e89e00a83/file-%C3%A9%C3%A0.pdf?url=https%3A%2F%2Fexample.com%2Ffile-%C3%A9%C3%A0.pdf&cd=1234"`
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

        expect(generateFileUrl(source, pathPrefix)).toMatchInlineSnapshot(
          `"/prefix/_gatsby/file/6e41758c045f4509e19938d738d2a23c/file%20test.pdf?url=https%3A%2F%2Fexample.com%2Ffile+test.pdf&cd=1234"`
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

        expect(generateFileUrl(source, pathPrefix)).toMatchInlineSnapshot(
          `"/prefix/_gatsby/file/799c0b15477311f5b8d9f635594671f2/file%20test.pdf?url=https%3A%2F%2Fexample.com%2Ffile%2520test.pdf&cd=1234"`
        )
      })
    })
  })
})

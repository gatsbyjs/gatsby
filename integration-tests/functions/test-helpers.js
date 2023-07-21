const fetch = require(`node-fetch`)
const { createReadStream } = require("fs")
const execa = require(`execa`)
const fs = require(`fs-extra`)
const path = require(`path`)
const FormData = require("form-data")

jest.setTimeout(15000)

const FETCH_RETRY_COUNT = 2
async function fetchWithRetry(...args) {
  for (let i = 0; i <= FETCH_RETRY_COUNT; i++) {
    try {
      const response = await fetch(...args)
      return response
    } catch (e) {
      // ignore unless last retry
      if (i === FETCH_RETRY_COUNT) {
        throw e
      }
    }
  }
}

export function runTests(env, host) {
  describe(env, () => {
    test(`top-level API`, async () => {
      const result = await fetchWithRetry(`${host}/api/top-level`).then(res =>
        res.text()
      )

      expect(result).toMatchSnapshot()
    })
    test(`secondary-level API`, async () => {
      const result = await fetchWithRetry(
        `${host}/api/a-directory/function`
      ).then(res => res.text())

      expect(result).toMatchSnapshot()
    })
    test(`secondary-level API with index.js`, async () => {
      const result = await fetchWithRetry(`${host}/api/a-directory`).then(res =>
        res.text()
      )

      expect(result).toMatchSnapshot()
    })
    test(`secondary-level API`, async () => {
      const result = await fetchWithRetry(`${host}/api/dir/function`).then(
        res => res.text()
      )

      expect(result).toMatchSnapshot()
    })

    test(`routes with special characters`, async () => {
      const routes = [
        `${host}/api/I-Am-Capitalized`,
        `${host}/api/some whitespace`,
        `${host}/api/with-äöü-umlaut`,
        `${host}/api/some-àè-french`,
        encodeURI(`${host}/api/some-אודות`),
      ]

      for (const route of routes) {
        const result = await fetchWithRetry(route).then(res => res.text())

        expect(result).toMatchSnapshot()
      }
    })

    describe(`dynamic routes`, () => {
      test(`param routes`, async () => {
        const routes = [`${host}/api/users/23/additional`]

        for (const route of routes) {
          const result = await fetchWithRetry(route).then(res => res.json())

          expect(result).toMatchSnapshot()
        }
      })
      test(`unnamed wildcard routes`, async () => {
        const routes = [`${host}/api/dir/super`]
        for (const route of routes) {
          const result = await fetchWithRetry(route).then(res => res.json())

          expect(result).toMatchSnapshot()
        }
      })
      test(`named wildcard routes`, async () => {
        const route = `${host}/api/named-wildcard/super`
        const result = await fetchWithRetry(route).then(res => res.json())

        expect(result).toMatchInlineSnapshot(`
          Object {
            "foo": "super",
          }
        `)
      })
    })

    describe(`environment variables`, () => {
      test(`can use inside functions`, async () => {
        const result = await fetchWithRetry(`${host}/api/env-variables`).then(
          res => res.text()
        )

        expect(result).toEqual(`word`)
      })
    })

    describe(`typescript`, () => {
      test(`typescript functions work`, async () => {
        const result = await fetchWithRetry(`${host}/api/i-am-typescript`).then(
          res => res.text()
        )

        expect(result).toMatchSnapshot()
      })
    })

    describe(`function errors don't crash the server`, () => {
      // This test mainly just shows that the server doesn't crash.
      test(`normal`, async () => {
        const result = await fetchWithRetry(
          `${host}/api/error-send-function-twice`
        )

        expect(result.status).toEqual(200)
      })

      test(`no handler function export`, async () => {
        const result = await fetchWithRetry(`${host}/api/no-function-export`)

        expect(result.status).toEqual(500)
        const body = await result.text()

        if (env === `develop`) {
          expect(body).toMatch(/Error when executing function/)
          expect(body).toMatch(/does not export a function/)
        } else {
          // details are not exposed in `gatsby serve`
          expect(body).toEqual(`Internal Server Error`)
        }
      })

      test(`function throws`, async () => {
        const result = await fetchWithRetry(`${host}/api/function-throw`)

        expect(result.status).toEqual(500)
        const body = await result.text()
        if (env === `develop`) {
          expect(body).toMatch(/Error when executing function/)
          expect(body).toMatch(/some error/)
        } else {
          // details are not exposed in `gatsby serve`
          expect(body).toEqual(`Internal Server Error`)
        }
      })
    })

    describe(`response formats`, () => {
      test(`returns json correctly`, async () => {
        const res = await fetchWithRetry(`${host}/api/i-am-json`)
        const result = await res.json()

        const { date, ...headers } = Object.fromEntries(res.headers)
        expect(result).toMatchSnapshot()
        expect(headers).toMatchSnapshot()
      })
      test(`returns text correctly`, async () => {
        const res = await fetchWithRetry(`${host}/api/i-am-typescript`)
        const result = await res.text()

        const { date, ...headers } = Object.fromEntries(res.headers)
        expect(result).toMatchSnapshot()
        expect(headers).toMatchSnapshot()
      })
    })

    describe(`functions can send custom statuses`, () => {
      test(`can return 200 status`, async () => {
        const res = await fetchWithRetry(`${host}/api/status`)

        expect(res.status).toEqual(200)
      })

      test(`can return 404 status`, async () => {
        const res = await fetchWithRetry(`${host}/api/status?code=404`)

        expect(res.status).toEqual(404)
      })

      test(`can return 500 status`, async () => {
        const res = await fetchWithRetry(`${host}/api/status?code=500`)

        expect(res.status).toEqual(500)
      })
    })

    describe(`functions can parse different ways of sending data`, () => {
      test(`query string`, async () => {
        const result = await fetchWithRetry(
          `${host}/api/parser?amIReal=true`
        ).then(res => res.json())

        expect(result).toMatchSnapshot()
      })

      test(`form parameters`, async () => {
        const { URLSearchParams } = require("url")
        const params = new URLSearchParams()
        params.append("a", `form parameters`)
        const result = await fetchWithRetry(`${host}/api/parser`, {
          method: `POST`,
          body: params,
        }).then(res => res.json())

        expect(result).toMatchSnapshot()
      })

      test(`form data`, async () => {
        const FormData = require("form-data")

        const form = new FormData()
        form.append("a", `form-data`)
        const result = await fetchWithRetry(`${host}/api/parser`, {
          method: `POST`,
          body: form,
        }).then(res => res.json())

        expect(result).toMatchSnapshot()
      })

      test(`json body`, async () => {
        const body = { a: `json` }
        const result = await fetchWithRetry(`${host}/api/parser`, {
          method: `POST`,
          body: JSON.stringify(body),
          headers: { "Content-Type": "application/json" },
        }).then(res => res.json())

        expect(result).toMatchSnapshot()
      })

      test(`file in multipart/form`, async () => {
        const file = createReadStream(
          path.join(__dirname, "./__tests__/fixtures/test.txt")
        )

        const form = new FormData()
        form.append("file", file)
        const result = await fetchWithRetry(`${host}/api/parser`, {
          method: `POST`,
          body: form,
        }).then(res => res.json())

        expect(result).toMatchSnapshot()
      })

      // TODO enable when functions support streaming files.
      // test(`stream a file`, async () => {
      // const { createReadStream } = require("fs")

      // const stream = createReadStream(path.join(__dirname, "./fixtures/test.txt"))
      // const res = await fetchWithRetry(`${host}/api/parser`, {
      // method: `POST`,
      // body: stream,
      // })

      // console.log(res)

      // expect(result).toMatchSnapshot()
      // })
    })

    describe(`functions get parsed cookies`, () => {
      test(`cookie`, async () => {
        const result = await fetchWithRetry(`${host}/api/cookie-me`, {
          headers: { cookie: `foo=blue;` },
        }).then(res => res.json())

        expect(result).toMatchSnapshot()
      })
    })

    describe(`functions can redirect`, () => {
      test(`normal`, async () => {
        const result = await fetchWithRetry(`${host}/api/redirect-me`)

        expect(result.url).toEqual(host + `/`)
      })
    })

    describe(`functions can have custom middleware`, () => {
      test(`normal`, async () => {
        const result = await fetchWithRetry(`${host}/api/cors`)

        const headers = Object.fromEntries(result.headers)
        expect(headers[`access-control-allow-origin`]).toEqual(`*`)
      })
    })

    describe(`functions can configure body parsing middleware`, () => {
      describe(`text`, () => {
        describe(`50kb string`, () => {
          const body = `x`.repeat(50 * 1024)
          it(`on default config`, async () => {
            const result = await fetchWithRetry(`${host}/api/config/defaults`, {
              method: `POST`,
              body,
              headers: {
                "content-type": "text/plain",
              },
            })

            expect(result.status).toBe(200)
            const responseBody = await result.json()

            expect(responseBody).toMatchInlineSnapshot(`
              Object {
                "body": "'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'... 51100 more characters",
              }
            `)
          })

          it(`on { bodyParser: { text: { limit: "100mb" }}}`, async () => {
            const result = await fetchWithRetry(
              `${host}/api/config/body-parser-text-limit`,
              {
                method: `POST`,
                body,
                headers: {
                  "content-type": "text/plain",
                },
              }
            )

            expect(result.status).toBe(200)
            const responseBody = await result.json()

            expect(responseBody).toMatchInlineSnapshot(`
              Object {
                "body": "'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'... 51100 more characters",
              }
            `)
          })
        })

        describe(`50mb string`, () => {
          const body = `x`.repeat(50 * 1024 * 1024)
          it(`on default config`, async () => {
            const result = await fetchWithRetry(`${host}/api/config/defaults`, {
              method: `POST`,
              body,
              headers: {
                "content-type": "text/plain",
              },
            })

            expect(result.status).toBe(413)
          })

          it(`on { bodyParser: { text: { limit: "100mb" }}}`, async () => {
            const result = await fetchWithRetry(
              `${host}/api/config/body-parser-text-limit`,
              {
                method: `POST`,
                body,
                headers: {
                  "content-type": "text/plain",
                },
              }
            )

            expect(result.status).toBe(200)
            const responseBody = await result.json()

            expect(responseBody).toMatchInlineSnapshot(`
              Object {
                "body": "'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'... 52428700 more characters",
              }
            `)
          })
        })

        describe(`custom type`, () => {
          const body = `test-string`
          it(`on default config`, async () => {
            const result = await fetchWithRetry(`${host}/api/config/defaults`, {
              method: `POST`,
              body,
              headers: {
                "content-type": "custom/type",
              },
            })

            expect(result.status).toBe(200)
            const responseBody = await result.json()

            expect(responseBody).toMatchInlineSnapshot(`
              Object {
                "body": "{}",
              }
            `)
          })

          it(`on { bodyParser: { text: { type: "*/*" }}}`, async () => {
            const result = await fetchWithRetry(
              `${host}/api/config/body-parser-text-type`,
              {
                method: `POST`,
                body,
                headers: {
                  "content-type": "custom/type",
                },
              }
            )

            expect(result.status).toBe(200)
            const responseBody = await result.json()

            expect(responseBody).toMatchInlineSnapshot(`
              Object {
                "body": "'test-string'",
              }
            `)
          })
        })
      })

      describe(`json`, () => {
        describe(`50kb json`, () => {
          const body = JSON.stringify({
            content: `x`.repeat(50 * 1024),
          })
          it(`on default config`, async () => {
            const result = await fetchWithRetry(`${host}/api/config/defaults`, {
              method: `POST`,
              body,
              headers: {
                "content-type": "application/json",
              },
            })

            expect(result.status).toBe(200)
            const responseBody = await result.json()

            expect(responseBody).toMatchInlineSnapshot(`
              Object {
                "body": "{
                content: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'... 51100 more characters
              }",
              }
            `)
          })

          it(`on { bodyParser: { json: { limit: "100mb" }}}`, async () => {
            const result = await fetchWithRetry(
              `${host}/api/config/body-parser-json-limit`,
              {
                method: `POST`,
                body,
                headers: {
                  "content-type": "application/json",
                },
              }
            )

            expect(result.status).toBe(200)
            const responseBody = await result.json()

            expect(responseBody).toMatchInlineSnapshot(`
              Object {
                "body": "{
                content: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'... 51100 more characters
              }",
              }
            `)
          })
        })

        describe(`50mb json`, () => {
          const body = JSON.stringify({
            content: `x`.repeat(50 * 1024 * 1024),
          })
          it(`on default config`, async () => {
            const result = await fetchWithRetry(`${host}/api/config/defaults`, {
              method: `POST`,
              body,
              headers: {
                "content-type": "application/json",
              },
            })

            expect(result.status).toBe(413)
          })

          it(`on { bodyParser: { json: { limit: "100mb" }}}`, async () => {
            const result = await fetchWithRetry(
              `${host}/api/config/body-parser-json-limit`,
              {
                method: `POST`,
                body,
                headers: {
                  "content-type": "application/json",
                },
              }
            )

            expect(result.status).toBe(200)
            const responseBody = await result.json()

            expect(responseBody).toMatchInlineSnapshot(`
              Object {
                "body": "{
                content: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'... 52428700 more characters
              }",
              }
            `)
          })
        })

        describe(`custom type`, () => {
          const body = JSON.stringify({
            content: `test-string`,
          })
          it(`on default config`, async () => {
            const result = await fetchWithRetry(`${host}/api/config/defaults`, {
              method: `POST`,
              body,
              headers: {
                "content-type": "custom/type",
              },
            })

            expect(result.status).toBe(200)
            const responseBody = await result.json()

            expect(responseBody).toMatchInlineSnapshot(`
              Object {
                "body": "{}",
              }
            `)
          })

          it(`on { bodyParser: { json: { type: "*/*" }}}`, async () => {
            const result = await fetchWithRetry(
              `${host}/api/config/body-parser-json-type`,
              {
                method: `POST`,
                body,
                headers: {
                  "content-type": "custom/type",
                },
              }
            )

            expect(result.status).toBe(200)
            const responseBody = await result.json()

            expect(responseBody).toMatchInlineSnapshot(`
              Object {
                "body": "{ content: 'test-string' }",
              }
            `)
          })
        })
      })

      describe(`raw`, () => {
        describe(`50kb raw`, () => {
          const body = JSON.stringify({
            content: `x`.repeat(50 * 1024),
          })
          it(`on default config`, async () => {
            const result = await fetchWithRetry(`${host}/api/config/defaults`, {
              method: `POST`,
              body,
              headers: {
                "content-type": "application/octet-stream",
              },
            })

            expect(result.status).toBe(200)
            const responseBody = await result.json()

            expect(responseBody).toMatchInlineSnapshot(`
              Object {
                "body": "<Buffer 7b 22 63 6f 6e 74 65 6e 74 22 3a 22 78 78 78 78 78 78 78 78 78 78 78 78 78 78 78 78 78 78 78 78 78 78 78 78 78 78 78 78 78 78 78 78 78 78 78 78 78 78 ... 51164 more bytes>",
              }
            `)
          })

          it(`on { bodyParser: { raw: { limit: "100mb" }}}`, async () => {
            const result = await fetchWithRetry(
              `${host}/api/config/body-parser-raw-limit`,
              {
                method: `POST`,
                body,
                headers: {
                  "content-type": "application/octet-stream",
                },
              }
            )

            expect(result.status).toBe(200)
            const responseBody = await result.json()

            expect(responseBody).toMatchInlineSnapshot(`
              Object {
                "body": "<Buffer 7b 22 63 6f 6e 74 65 6e 74 22 3a 22 78 78 78 78 78 78 78 78 78 78 78 78 78 78 78 78 78 78 78 78 78 78 78 78 78 78 78 78 78 78 78 78 78 78 78 78 78 78 ... 51164 more bytes>",
              }
            `)
          })
        })

        describe(`50mb raw`, () => {
          const body = JSON.stringify({
            content: `x`.repeat(50 * 1024 * 1024),
          })
          it(`on default config`, async () => {
            const result = await fetchWithRetry(`${host}/api/config/defaults`, {
              method: `POST`,
              body,
              headers: {
                "content-type": "application/octet-stream",
              },
            })

            expect(result.status).toBe(413)
          })

          it(`on { bodyParser: { raw: { limit: "100mb" }}}`, async () => {
            const result = await fetchWithRetry(
              `${host}/api/config/body-parser-raw-limit`,
              {
                method: `POST`,
                body,
                headers: {
                  "content-type": "application/octet-stream",
                },
              }
            )

            expect(result.status).toBe(200)
            const responseBody = await result.json()

            expect(responseBody).toMatchInlineSnapshot(`
              Object {
                "body": "<Buffer 7b 22 63 6f 6e 74 65 6e 74 22 3a 22 78 78 78 78 78 78 78 78 78 78 78 78 78 78 78 78 78 78 78 78 78 78 78 78 78 78 78 78 78 78 78 78 78 78 78 78 78 78 ... 52428764 more bytes>",
              }
            `)
          })
        })

        describe(`custom type (using 'custom/type' payload)`, () => {
          const body = JSON.stringify({
            content: `test-string`,
          })
          it(`on default config`, async () => {
            const result = await fetchWithRetry(`${host}/api/config/defaults`, {
              method: `POST`,
              body,
              headers: {
                "content-type": "custom/type",
              },
            })

            expect(result.status).toBe(200)
            const responseBody = await result.json()

            expect(responseBody).toMatchInlineSnapshot(`
              Object {
                "body": "{}",
              }
            `)
          })

          it(`on { bodyParser: { raw: { type: "*/*" }}}`, async () => {
            const result = await fetchWithRetry(
              `${host}/api/config/body-parser-raw-type`,
              {
                method: `POST`,
                body,
                headers: {
                  "content-type": "custom/type",
                },
              }
            )

            expect(result.status).toBe(200)
            const responseBody = await result.json()

            expect(responseBody).toMatchInlineSnapshot(`
              Object {
                "body": "<Buffer 7b 22 63 6f 6e 74 65 6e 74 22 3a 22 74 65 73 74 2d 73 74 72 69 6e 67 22 7d>",
              }
            `)
          })
        })

        describe(`'application/json' payload`, () => {
          const body = JSON.stringify({
            content: `test-string`,
          })
          it(`on default config`, async () => {
            const result = await fetchWithRetry(`${host}/api/config/defaults`, {
              method: `POST`,
              body,
              headers: {
                "content-type": "application/json",
              },
            })

            expect(result.status).toBe(200)
            const responseBody = await result.json()

            // default config will use default config for "application/json" type
            expect(responseBody).toMatchInlineSnapshot(`
              Object {
                "body": "{ content: 'test-string' }",
              }
            `)
          })

          it(`on { bodyParser: { raw: { type: "*/*" }}}`, async () => {
            const result = await fetchWithRetry(
              `${host}/api/config/body-parser-raw-type`,
              {
                method: `POST`,
                body,
                headers: {
                  "content-type": "application/json",
                },
              }
            )

            expect(result.status).toBe(200)
            const responseBody = await result.json()

            // despite application/json payload, we get
            // expected Buffer
            expect(responseBody).toMatchInlineSnapshot(`
              Object {
                "body": "<Buffer 7b 22 63 6f 6e 74 65 6e 74 22 3a 22 74 65 73 74 2d 73 74 72 69 6e 67 22 7d>",
              }
            `)
          })
        })
      })

      describe(`urlencoded`, () => {
        describe(`50kb urlencoded`, () => {
          // for urlencoded using "URLSearchParams"
          // FormData creates multipart request which
          // is not what this middleware handles

          const body = new URLSearchParams()
          body.append(`content`, `x`.repeat(50 * 1024))

          it(`on default config`, async () => {
            const result = await fetchWithRetry(`${host}/api/config/defaults`, {
              method: `POST`,
              body,
              headers: {
                "content-type": "application/x-www-form-urlencoded",
              },
            })

            expect(result.status).toBe(200)
            const responseBody = await result.json()

            expect(responseBody).toMatchInlineSnapshot(`
              Object {
                "body": "{
                content: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'... 51100 more characters
              }",
              }
            `)
          })

          it(`on { bodyParser: { urlencoded: { limit: "100mb" }}}`, async () => {
            const result = await fetchWithRetry(
              `${host}/api/config/body-parser-urlencoded-limit`,
              {
                method: `POST`,
                body,
                headers: {
                  "content-type": "application/x-www-form-urlencoded",
                },
              }
            )

            expect(result.status).toBe(200)
            const responseBody = await result.json()

            expect(responseBody).toMatchInlineSnapshot(`
              Object {
                "body": "{
                content: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'... 51100 more characters
              }",
              }
            `)
          })
        })

        describe(`50mb urlencoded`, () => {
          // for urlencoded using "URLSearchParams"
          // FormData creates multipart request which
          // is not what this middleware handles
          const body = new URLSearchParams()
          body.append(`content`, `x`.repeat(50 * 1024 * 1024))

          it(`on default config`, async () => {
            const result = await fetchWithRetry(`${host}/api/config/defaults`, {
              method: `POST`,
              body,
              headers: {
                "content-type": "application/x-www-form-urlencoded",
              },
            })

            expect(result.status).toBe(413)
          })

          it(`on { bodyParser: { urlencoded: { limit: "100mb" }}}`, async () => {
            const result = await fetchWithRetry(
              `${host}/api/config/body-parser-urlencoded-limit`,
              {
                method: `POST`,
                body,
                headers: {
                  "content-type": "application/x-www-form-urlencoded",
                },
              }
            )

            expect(result.status).toBe(200)
            const responseBody = await result.json()

            expect(responseBody).toMatchInlineSnapshot(`
              Object {
                "body": "{
                content: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'... 52428700 more characters
              }",
              }
            `)
          })
        })

        describe(`custom type`, () => {
          // for urlencoded using "URLSearchParams"
          // FormData creates multipart request which
          // is not what this middleware handles
          const body = new URLSearchParams()
          body.append(`content`, `test-string`)

          it(`on default config`, async () => {
            const result = await fetchWithRetry(`${host}/api/config/defaults`, {
              method: `POST`,
              body,
              headers: {
                "content-type": "custom/type",
              },
            })

            expect(result.status).toBe(200)
            const responseBody = await result.json()

            expect(responseBody).toMatchInlineSnapshot(`
              Object {
                "body": "{}",
              }
            `)
          })

          it(`on { bodyParser: { urlencoded: { type: "*/*" }}}`, async () => {
            const result = await fetchWithRetry(
              `${host}/api/config/body-parser-urlencoded-type`,
              {
                method: `POST`,
                body,
                headers: {
                  "content-type": "custom/type",
                },
              }
            )

            expect(result.status).toBe(200)
            const responseBody = await result.json()

            expect(responseBody).toMatchInlineSnapshot(`
              Object {
                "body": "{ content: 'test-string' }",
              }
            `)
          })
        })
      })
    })

    describe(`plugins can declare functions and they can be shadowed`, () => {
      test(`shadowing`, async () => {
        const result = await fetchWithRetry(
          `${host}/api/gatsby-plugin-cool/shadowed`
        ).then(res => res.text())
        expect(result).toEqual(`I am shadowed`)

        const result2 = await fetchWithRetry(
          `${host}/api/gatsby-plugin-cool/not-shadowed`
        ).then(res => res.text())
        expect(result2).toEqual(`I am not shadowed`)
      })
      test(`plugins can't declare functions outside of their namespace`, async () => {
        const result = await fetchWithRetry(
          `${host}/api/i-will-not-work-cause-namespacing`
        )
        expect(result.status).toEqual(404)
      })
    })

    describe(`typescript files are resolved without needing to specify their extension`, () => {
      test(`typescript`, async () => {
        const result = await fetchWithRetry(`${host}/api/extensions`).then(
          res => res.text()
        )
        expect(result).toEqual(`hi`)
      })
    })

    describe(`ignores files that match the pattern`, () => {
      test(`dotfile`, async () => {
        const result = await fetchWithRetry(`${host}/api/ignore/.config`)
        expect(result.status).toEqual(404)
      })
      test(`.d.ts file`, async () => {
        const result = await fetchWithRetry(`${host}/api/ignore/foo.d`)
        expect(result.status).toEqual(404)
      })
      test(`test file`, async () => {
        const result = await fetchWithRetry(`${host}/api/ignore/hello.test`)
        expect(result.status).toEqual(404)
      })
      test(`test directory`, async () => {
        const result = await fetchWithRetry(
          `${host}/api/ignore/__tests__/hello`
        )
        expect(result.status).toEqual(404)
      })
      test(`test file in plugin`, async () => {
        const result = await fetchWithRetry(
          `${host}/api/gatsby-plugin-cool/shadowed.test`
        )
        expect(result.status).toEqual(404)
      })
    })

    describe(`bundling`, () => {
      test(`should succeed when gatsby-core-utils is imported`, async () => {
        const result = await fetchWithRetry(
          `${host}/api/ignore-lmdb-require`
        ).then(res => res.text())
        expect(result).toEqual(`hello world`)
      })
    })

    // TODO figure out why this gets into endless loops
    // describe.only(`hot reloading`, () => {
    // const fixturesDir = path.join(__dirname, `fixtures`)
    // const apiDir = path.join(__dirname, `../src/api`)
    // beforeAll(() => {
    // try {
    // fs.unlinkSync(path.join(apiDir, `function-a.js`))
    // } catch (e) {
    // // Ignore as this should mostly error with file not found.
    // // We delete to be sure it's not there.
    // }
    // })
    // afterAll(() => {
    // fs.unlinkSync(path.join(apiDir, `function-a.js`))
    // })

    // test(`new function`, cb => {
    // fs.copySync(
    // path.join(fixturesDir, `function-a.js`),
    // path.join(apiDir, `function-a.js`)
    // )
    // setTimeout(async () => {
    // const result = await fetchWithRetry(
    // `${host}/api/function-a`
    // ).then(res => res.text())

    // console.log(result)
    // expect(result).toMatchSnapshot()
    // cb()
    // }, 400)
    // })
    // })
  })
}

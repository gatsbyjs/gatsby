const Joi = require(`@hapi/joi`)

const { validOptions } = require(`../plugin-options`)

const allOptionsValid = {
  name: `GatsbyJS`,
  short_name: `GatsbyJS`,
  start_url: `/`,
  background_color: `#f7f0eb`,
  display: `standalone`,
  theme_color: `#a2466c`,
  cache_busting_mode: `none`,
  include_favicon: false,
  theme_color_in_head: false,
  crossOrigin: `use-credentials`,
  legacy: false,
  icon: `src/images/icon.png`,
  icons: [
    {
      src: `/favicons/android-chrome-192x192.png`,
      sizes: `192x192`,
      type: `image/png`,
    },
    {
      src: `/favicons/android-chrome-512x512.png`,
      sizes: `512x512`,
      type: `image/png`,
    },
  ],
  lang: `en`,
  localize: [
    {
      start_url: `/de/`,
      lang: `de`,
      name: `Die coole Anwendung`,
      short_name: `Coole Anwendung`,
      description: `Die Anwendung macht coole Dinge und macht Ihr Leben besser.`,
    },
  ],
  icon_options: {
    purpose: `maskable`,
  },
}

const allOptionsInvalid = {
  cache_busting_mode: false,
  include_favicon: `no`,
  theme_color_in_head: `no`,
  crossOrigin: `allow`,
  legacy: `false`,
  icon: `bob`,
  icons: [
    `/favicons/android-chrome-192x192.png`,
    `/favicons/android-chrome-512x512.png`,
  ],
  lang: `en`,
  localize: {
    start_url: `/de/`,
    lang: `de`,
    name: `Die coole Anwendung`,
    short_name: `Coole Anwendung`,
    description: `Die Anwendung macht coole Dinge und macht Ihr Leben besser.`,
  },
  icon_options: [{ key: `purpose`, value: `maskable` }],
}

describe(`Options validation`, () => {
  const reporter = {
    panic: jest.fn(),
  }

  beforeEach(() => {
    reporter.panic.mockClear()
  })

  afterEach(() => {
    expect.hasAssertions()
  })

  const schema = validOptions(Joi)

  it(`Passes with valid options`, () => {
    expect(schema.validate(allOptionsValid)).resolves.toEqual(
      expect.any(Object)
    )
  })

  it(`Fails with missing required options`, async () => {
    try {
      await schema.validate({})
    } catch (e) {
      expect(e.name).toBe(`ValidationError`)
    }
  })

  it(`Fails with empty options`, async () => {
    try {
      await schema.validate({
        name: ``,
        short_name: ``,
      })
    } catch (e) {
      expect(e.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            message: expect.stringContaining(`is not allowed to be empty`),
          }),
        ])
      )
    }
  })

  it(`Fails with options of wrong types`, async () => {
    try {
      await schema.validate(allOptionsInvalid)
    } catch (e) {
      expect(e.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            message: expect.stringContaining(`must be a`),
          }),
        ])
      )
    }
  })

  it(`Fails if either or both icon or icons don't exist`, async () => {
    try {
      await schema.validate({})
    } catch (e) {
      expect(e.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            message: expect.stringContaining(
              `must contain at least one of [icon, icons]`
            ),
          }),
        ])
      )
    }
  })

  it(`Fails if lang isn't included with the use of localize`, async () => {
    try {
      let brokeOptions = { ...allOptionsValid }
      delete brokeOptions.lang
      await schema.validate(brokeOptions)
    } catch (e) {
      expect(e.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            context: expect.objectContaining({
              main: expect.stringContaining(`localize`),
              peer: expect.stringContaining(`lang`),
            }),
          }),
        ])
      )
    }
  })
})

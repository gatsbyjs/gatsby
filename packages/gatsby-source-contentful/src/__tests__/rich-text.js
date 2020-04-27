const { getNormalizedRichTextField } = require(`../rich-text`)

const entryFactory = () => {
  return {
    sys: {
      id: `abc123`,
      contentType: { sys: { id: `article` } },
      type: `Entry`,
    },
    fields: {
      title: { en: `Title`, de: `Titel` },
      relatedArticle: {
        en: {
          sys: {
            contentType: { sys: { id: `article` } },
            type: `Entry`,
          },
          fields: {
            title: { en: `Title two`, de: `Titel zwei` },
          },
        },
      },
    },
  }
}

const assetFactory = () => {
  return {
    sys: {
      type: `Asset`,
    },
    fields: {
      file: {
        en: {
          url: `//images.ctfassets.net/asset.jpg`,
        },
      },
    },
  }
}

describe(`getNormalizedRichTextField()`, () => {
  let contentTypesById
  let currentLocale
  let defaultLocale
  let getField

  beforeEach(() => {
    contentTypesById = new Map()
    contentTypesById.set(`article`, {
      sys: { id: `article` },
      fields: [
        { id: `title`, localized: true },
        { id: `relatedArticle`, localized: false },
      ],
    })
    currentLocale = `en`
    defaultLocale = `en`
    getField = field => field[currentLocale]
  })

  describe(`when the rich-text object has no entry references`, () => {
    it(`returns the object as-is`, () => {
      const field = {
        nodeType: `document`,
        data: {},
        content: [
          {
            nodeType: `text`,
            data: {},
            content: `This is a test`,
          },
        ],
      }
      expect(
        getNormalizedRichTextField({
          field,
          contentTypesById,
          getField,
          defaultLocale,
        })
      ).toEqual(field)
    })
  })

  describe(`when a rich-text node contains an entry reference`, () => {
    describe(`a localized field`, () => {
      describe(`when the current locale is \`en\``, () => {
        beforeEach(() => (currentLocale = `en`))

        it(`resolves the locale for the field`, () => {
          const field = {
            nodeType: `document`,
            data: {},
            content: [
              {
                nodeType: `embedded-entry-inline`,
                data: { target: entryFactory() },
              },
            ],
          }

          const expectedTitle = `Title`
          const actualTitle = getNormalizedRichTextField({
            field,
            contentTypesById,
            getField,
            defaultLocale,
          }).content[0].data.target.fields.title

          expect(actualTitle).toBe(expectedTitle)
        })
      })

      describe(`when the current locale is \`de\``, () => {
        beforeEach(() => (currentLocale = `de`))

        it(`resolves the locale for the field`, () => {
          const field = {
            nodeType: `document`,
            data: {},
            content: [
              {
                nodeType: `embedded-entry-inline`,
                data: { target: entryFactory() },
              },
            ],
          }

          const expectedTitle = `Titel`
          const actualTitle = getNormalizedRichTextField({
            field,
            contentTypesById,
            getField,
            defaultLocale,
          }).content[0].data.target.fields.title

          expect(actualTitle).toBe(expectedTitle)
        })
      })
    })

    describe(`a nested localized field`, () => {
      beforeEach(() => {
        currentLocale = `de`
      })

      it(`resolves the locale for the nested field`, () => {
        const field = {
          nodeType: `document`,
          data: {},
          content: [
            {
              nodeType: `embedded-entry-inline`,
              data: { target: entryFactory() },
            },
          ],
        }

        const expectedTitle = `Titel zwei`
        const actualTitle = getNormalizedRichTextField({
          field,
          contentTypesById,
          getField,
          defaultLocale,
        }).content[0].data.target.fields.relatedArticle.fields.title

        expect(actualTitle).toBe(expectedTitle)
      })
    })
  })

  describe(`when a rich-text node contains an asset reference`, () => {
    describe(`when the current locale is \`en\``, () => {
      beforeEach(() => (currentLocale = `en`))

      it(`resolves the locale for the field`, () => {
        const field = {
          nodeType: `document`,
          data: {},
          content: [
            {
              nodeType: `embedded-asset-block`,
              data: { target: assetFactory() },
            },
          ],
        }

        const expectedURL = `//images.ctfassets.net/asset.jpg`
        const actualURL = getNormalizedRichTextField({
          field,
          contentTypesById,
          getField,
          defaultLocale,
        }).content[0].data.target.fields.file.url

        expect(actualURL).toBe(expectedURL)
      })
    })
  })

  describe(`when a referenced entry contains an asset field`, () => {
    describe(`when the current locale is \`en\``, () => {
      beforeEach(() => {
        contentTypesById.get(`article`).fields.push({
          id: `assetReference`,
          localized: true,
        })
        currentLocale = `en`
      })

      it(`resolves the locale for the asset's own fields`, () => {
        const field = {
          nodeType: `document`,
          data: {},
          content: [
            {
              nodeType: `embedded-entry-block`,
              data: { target: entryFactory() },
            },
          ],
        }

        field.content[0].data.target.fields.assetReference = {
          en: assetFactory(),
        }

        const expectedURL = `//images.ctfassets.net/asset.jpg`
        const actualURL = getNormalizedRichTextField({
          field,
          contentTypesById,
          getField,
          defaultLocale,
        }).content[0].data.target.fields.assetReference.fields.file.url

        expect(actualURL).toBe(expectedURL)
      })
    })
  })

  describe(`when an entry/asset reference field is an array`, () => {
    beforeEach(() => {
      contentTypesById.get(`article`).fields.push({
        id: `relatedArticles`,
        localized: false,
      })
      contentTypesById.get(`article`).fields.push({
        id: `relatedAssets`,
        localized: false,
      })
    })

    it(`resolves the locales of each entry in the array`, () => {
      const field = {
        nodeType: `document`,
        data: {},
        content: [
          {
            nodeType: `embedded-entry-block`,
            data: { target: entryFactory() },
          },
        ],
      }

      const relatedArticle = entryFactory()
      relatedArticle.fields.title = { en: `Related article #1` }

      field.content[0].data.target.fields.relatedArticles = {
        en: [relatedArticle],
      }

      const expectedTitle = `Related article #1`
      const actualTitle = getNormalizedRichTextField({
        field,
        contentTypesById,
        getField,
        defaultLocale,
      }).content[0].data.target.fields.relatedArticles[0].fields.title

      expect(actualTitle).toBe(expectedTitle)
    })

    it(`resolves the locales of each asset in the array`, () => {
      const field = {
        nodeType: `document`,
        data: {},
        content: [
          {
            nodeType: `embedded-entry-block`,
            data: { target: entryFactory() },
          },
        ],
      }

      const relatedAsset = assetFactory()
      relatedAsset.fields.file = {
        en: {
          url: `//images.ctfassets.net/related-asset.jpg`,
        },
      }

      field.content[0].data.target.fields.relatedAssets = {
        en: [relatedAsset],
      }

      const expectedURL = `//images.ctfassets.net/related-asset.jpg`
      const actualURL = getNormalizedRichTextField({
        field,
        contentTypesById,
        getField,
        defaultLocale,
      }).content[0].data.target.fields.relatedAssets[0].fields.file.url

      expect(actualURL).toBe(expectedURL)
    })
  })

  describe(`circular references`, () => {
    it(`prevents infinite loops when two entries reference each other`, () => {
      const entry1 = entryFactory()
      entry1.sys.id = `entry1-id`
      const entry2 = entryFactory()
      entry2.sys.id = `entry2-id`

      entry2.fields.title = {
        en: `Related article`,
        de: `German for "related article" ;)`,
      }

      // Link the two to each other
      entry1.fields.relatedArticle.en = entry2
      entry2.fields.relatedArticle.en = entry1

      const field = {
        nodeType: `document`,
        data: {},
        content: [
          {
            nodeType: `embedded-entry-inline`,
            data: { target: entry1 },
          },
        ],
      }

      expect(() => {
        getNormalizedRichTextField({
          field,
          contentTypesById,
          getField,
          defaultLocale,
        })
      }).not.toThrowError()
    })
  })
})

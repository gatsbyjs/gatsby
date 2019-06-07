const { getNormalizedRichTextField } = require(`../rich-text`)

const entryFactory = () => {
  return {
    sys: {
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
  let contentTypes
  let currentLocale
  let defaultLocale
  let getField

  beforeEach(() => {
    contentTypes = [
      {
        sys: { id: `article` },
        fields: [
          { id: `title`, localized: true },
          { id: `relatedArticle`, localized: false },
        ],
      },
    ]
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
          contentTypes,
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
            contentTypes,
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
            contentTypes,
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
          contentTypes,
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
          contentTypes,
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
        contentTypes[0].fields.push({
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
          contentTypes,
          getField,
          defaultLocale,
        }).content[0].data.target.fields.assetReference.fields.file.url

        expect(actualURL).toBe(expectedURL)
      })
    })
  })
})

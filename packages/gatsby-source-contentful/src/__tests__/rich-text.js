const { normalizeRichTextField } = require(`../rich-text`)

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

describe(`normalizeRichTextField()`, () => {
  let contentTypeItems
  let currentLocale
  let defaultLocale
  let getField

  beforeEach(() => {
    contentTypeItems = [
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
        normalizeRichTextField({
          field,
          contentTypeItems,
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
          const actualTitle = normalizeRichTextField({
            field,
            contentTypeItems,
            getField,
            defaultLocale,
          }).content[0].data.target.fields.title

          expect(expectedTitle).toEqual(actualTitle)
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
          const actualTitle = normalizeRichTextField({
            field,
            contentTypeItems,
            getField,
            defaultLocale,
          }).content[0].data.target.fields.title

          expect(actualTitle).toEqual(expectedTitle)
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
        const actualTitle = normalizeRichTextField({
          field,
          contentTypeItems,
          getField,
          defaultLocale,
        }).content[0].data.target.fields.relatedArticle.fields.title

        expect(actualTitle).toEqual(expectedTitle)
      })
    })
  })
})

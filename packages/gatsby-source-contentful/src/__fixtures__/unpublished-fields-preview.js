exports.contentTypeItems = () => [
  {
    sys: {
      space: {
        sys: {
          type: `Link`,
          linkType: `Space`,
          id: `gher8kc6pxn0`,
        },
      },
      type: `ContentType`,
      id: `typeWithTextField`,
      revision: 4,
      createdAt: `2022-04-07T12:36:28.853Z`,
      updatedAt: `2022-04-07T12:51:05.868Z`,
      environment: {
        sys: {
          id: `master`,
          type: `Link`,
          linkType: `Environment`,
        },
      },
    },
    displayField: `title`,
    name: `Type With Text Field`,
    description: ``,
    fields: [
      {
        id: `title`,
        name: `Title`,
        type: `Symbol`,
        localized: false,
        required: false,
        disabled: false,
        omitted: false,
      },
      {
        id: `textFieldNotRequired`,
        name: `Text Field Not Required`,
        type: `Symbol`,
        localized: false,
        required: false,
        disabled: false,
        omitted: false,
      },
      {
        id: `textFieldRequired`,
        name: `Text Field Required`,
        type: `Symbol`,
        localized: false,
        required: true,
        disabled: false,
        omitted: false,
      },
      {
        id: `localizedTextFieldRequired`,
        name: `Localized Text Field Required`,
        type: `Symbol`,
        localized: true,
        required: true,
        disabled: false,
        omitted: false,
      },
      {
        id: `localizedTextFieldNotRequired`,
        name: `Localized Text Field Not Required`,
        type: `Symbol`,
        localized: true,
        required: false,
        disabled: false,
        omitted: false,
      },
    ],
  },
]

exports.initialSync = () => {
  return {
    currentSyncData: {
      entries: [
        {
          metadata: {
            tags: [],
          },
          sys: {
            space: {
              sys: {
                type: `Link`,
                linkType: `Space`,
                id: `gher8kc6pxn0`,
              },
            },
            type: `Entry`,
            id: `ffDHCCwSEeozSX521OENf`,
            contentType: {
              sys: {
                type: `Link`,
                linkType: `ContentType`,
                id: `typeWithTextField`,
              },
            },
            revision: 2,
            createdAt: `2022-04-07T12:40:07.338Z`,
            updatedAt: `2022-04-07T12:55:34.729Z`,
            environment: {
              sys: {
                id: `master`,
                type: `Link`,
                linkType: `Environment`,
              },
            },
          },
          fields: {
            title: {
              "en-US": `Published With Valid Changes`,
            },
            textFieldNotRequired: {
              "en-US": `This value is not required and changed.`,
            },
            textFieldRequired: {
              "en-US": `This value is required and changed`,
            },
            localizedTextFieldRequired: {
              "en-US": `This value is required and changed.`,
            },
          },
        },
        {
          metadata: {
            tags: [],
          },
          sys: {
            space: {
              sys: {
                type: `Link`,
                linkType: `Space`,
                id: `gher8kc6pxn0`,
              },
            },
            type: `Entry`,
            id: `3PmbzmeujVtZ9DzWb8gKC6`,
            contentType: {
              sys: {
                type: `Link`,
                linkType: `ContentType`,
                id: `typeWithTextField`,
              },
            },
            revision: 3,
            createdAt: `2022-04-07T12:40:33.039Z`,
            updatedAt: `2022-04-07T12:55:04.122Z`,
            environment: {
              sys: {
                id: `master`,
                type: `Link`,
                linkType: `Environment`,
              },
            },
          },
          fields: {
            title: {
              "en-US": `Published With Invalid Changes`,
            },
            textFieldNotRequired: {
              "en-US": `This value is not required but changed.`,
            },
            localizedTextFieldRequired: {
              nl: `This field has only a dutch value. But english is required.`,
            },
          },
        },
        {
          metadata: {
            tags: [],
          },
          sys: {
            space: {
              sys: {
                type: `Link`,
                linkType: `Space`,
                id: `gher8kc6pxn0`,
              },
            },
            type: `Entry`,
            id: `6Ytmg0WgzqwcHCEiNxAoOF`,
            contentType: {
              sys: {
                type: `Link`,
                linkType: `ContentType`,
                id: `typeWithTextField`,
              },
            },
            revision: 0,
            createdAt: `2022-04-07T12:45:39.600Z`,
            updatedAt: `2022-04-07T12:52:16.910Z`,
            environment: {
              sys: {
                id: `master`,
                type: `Link`,
                linkType: `Environment`,
              },
            },
          },
          fields: {
            title: {
              "en-US": `Unpublished With Valid Data`,
            },
            textFieldRequired: {
              "en-US": `This field is required.`,
            },
            localizedTextFieldRequired: {
              "en-US": `This field is required.`,
            },
          },
        },
        {
          metadata: {
            tags: [],
          },
          sys: {
            space: {
              sys: {
                type: `Link`,
                linkType: `Space`,
                id: `gher8kc6pxn0`,
              },
            },
            type: `Entry`,
            id: `5bVDAzKgE3EcBQChWzYKWD`,
            contentType: {
              sys: {
                type: `Link`,
                linkType: `ContentType`,
                id: `typeWithTextField`,
              },
            },
            revision: 2,
            createdAt: `2022-04-07T12:39:42.322Z`,
            updatedAt: `2022-04-07T12:51:59.500Z`,
            environment: {
              sys: {
                id: `master`,
                type: `Link`,
                linkType: `Environment`,
              },
            },
          },
          fields: {
            title: {
              "en-US": `Published`,
            },
            textFieldNotRequired: {
              "en-US": `This value is not required.`,
            },
            textFieldRequired: {
              "en-US": `This value is required.`,
            },
            localizedTextFieldRequired: {
              "en-US": `This field is required. Only english locale has a value.`,
            },
            localizedTextFieldNotRequired: {
              nl: `This field is not required. Only dutch locale has a value.`,
            },
          },
        },
        {
          metadata: {
            tags: [],
          },
          sys: {
            space: {
              sys: {
                type: `Link`,
                linkType: `Space`,
                id: `gher8kc6pxn0`,
              },
            },
            type: `Entry`,
            id: `7yv71seYFiyVvFu16pvzBU`,
            contentType: {
              sys: {
                type: `Link`,
                linkType: `ContentType`,
                id: `typeWithTextField`,
              },
            },
            revision: 0,
            createdAt: `2022-04-07T12:45:59.812Z`,
            updatedAt: `2022-04-07T12:46:27.576Z`,
            environment: {
              sys: {
                id: `master`,
                type: `Link`,
                linkType: `Environment`,
              },
            },
          },
          fields: {
            title: {
              "en-US": `Unpublished With Invalid Data`,
            },
            textFieldNotRequired: {
              "en-US": `This field is not required.`,
            },
          },
        },
      ],
      assets: [
        {
          metadata: {
            tags: [],
          },
          sys: {
            space: {
              sys: {
                type: `Link`,
                linkType: `Space`,
                id: `gher8kc6pxn0`,
              },
            },
            type: `Asset`,
            id: `GNeUY0UXLjICCg858dL4u`,
            revision: 1,
            createdAt: `2022-04-07T13:01:58.258Z`,
            updatedAt: `2022-04-07T13:04:39.045Z`,
            environment: {
              sys: {
                id: `master`,
                type: `Link`,
                linkType: `Environment`,
              },
            },
          },
          fields: {
            title: {
              "en-US": `Published With Invalid Data`,
              nl: `Gatsby Monogram`,
            },
            file: {
              nl: {
                url: `//images.ctfassets.net/gher8kc6pxn0/GNeUY0UXLjICCg858dL4u/88f73151cd9cbf2b75bdbe79e1fe1911/Gatsby_Monogram.png`,
                details: {
                  size: 77907,
                  image: {
                    width: 2000,
                    height: 2000,
                  },
                },
                fileName: `Gatsby_Monogram.png`,
                contentType: `image/png`,
              },
            },
          },
        },
        {
          metadata: {
            tags: [],
          },
          sys: {
            space: {
              sys: {
                type: `Link`,
                linkType: `Space`,
                id: `gher8kc6pxn0`,
              },
            },
            type: `Asset`,
            id: `63n9F33sETxyat165EXfiA`,
            revision: 1,
            createdAt: `2022-04-07T13:00:33.684Z`,
            updatedAt: `2022-04-07T13:04:29.449Z`,
            environment: {
              sys: {
                id: `master`,
                type: `Link`,
                linkType: `Environment`,
              },
            },
          },
          fields: {
            title: {
              "en-US": `Published With Valid Data`,
              nl: `Gatsby Logo Black`,
            },
            file: {
              "en-US": {
                url: `//images.ctfassets.net/gher8kc6pxn0/63n9F33sETxyat165EXfiA/ca1a1c68dc0252ac3468234cc7c3209e/Gatsby_Monogram_Black.png`,
                details: {
                  size: 74574,
                  image: {
                    width: 2000,
                    height: 2000,
                  },
                },
                fileName: `Gatsby_Monogram_Black.png`,
                contentType: `image/png`,
              },
              nl: {
                url: `//images.ctfassets.net/gher8kc6pxn0/63n9F33sETxyat165EXfiA/c1129b9b36d1d2113c5708efb180d083/Gatsby_Logo_Black.png`,
                details: {
                  size: 36793,
                  image: {
                    width: 2000,
                    height: 555,
                  },
                },
                fileName: `Gatsby_Logo_Black.png`,
                contentType: `image/png`,
              },
            },
          },
        },
        {
          metadata: {
            tags: [],
          },
          sys: {
            space: {
              sys: {
                type: `Link`,
                linkType: `Space`,
                id: `gher8kc6pxn0`,
              },
            },
            type: `Asset`,
            id: `1e1EpEOdZCZELT8UZAk8mD`,
            revision: 0,
            createdAt: `2022-04-07T13:02:47.259Z`,
            updatedAt: `2022-04-07T13:04:04.909Z`,
            environment: {
              sys: {
                id: `master`,
                type: `Link`,
                linkType: `Environment`,
              },
            },
          },
          fields: {
            title: {
              "en-US": `Unpublished With Valid Data`,
            },
            file: {
              "en-US": {
                url: `//images.ctfassets.net/gher8kc6pxn0/1e1EpEOdZCZELT8UZAk8mD/0fcf3d8a72a9cbd90f4b1d4de0d99881/Gatsby_Logo-png`,
                details: {
                  size: 37313,
                  image: {
                    width: 2000,
                    height: 555,
                  },
                },
                fileName: `Gatsby_Logo-png`,
                contentType: `image/png`,
              },
            },
          },
        },
        {
          metadata: {
            tags: [],
          },
          sys: {
            space: {
              sys: {
                type: `Link`,
                linkType: `Space`,
                id: `gher8kc6pxn0`,
              },
            },
            type: `Asset`,
            id: `3mtrGQlrFJTvpulIisyVuJ`,
            revision: 0,
            createdAt: `2022-04-07T13:03:29.938Z`,
            updatedAt: `2022-04-07T13:03:42.990Z`,
            environment: {
              sys: {
                id: `master`,
                type: `Link`,
                linkType: `Environment`,
              },
            },
          },
          fields: {
            title: {
              "en-US": `Unpublished With Invalid Data`,
            },
          },
        },
        {
          metadata: {
            tags: [],
          },
          sys: {
            space: {
              sys: {
                type: `Link`,
                linkType: `Space`,
                id: `gher8kc6pxn0`,
              },
            },
            type: `Asset`,
            id: `5lDlIqBwlFPGJNoeaImMd3`,
            revision: 1,
            createdAt: `2022-04-07T12:55:45.496Z`,
            updatedAt: `2022-04-07T13:00:29.381Z`,
            environment: {
              sys: {
                id: `master`,
                type: `Link`,
                linkType: `Environment`,
              },
            },
          },
          fields: {
            title: {
              "en-US": `Published`,
            },
            file: {
              "en-US": {
                url: `//images.ctfassets.net/gher8kc6pxn0/5lDlIqBwlFPGJNoeaImMd3/8624358d3433eca3a4a0dede0c47097a/Gatsby_Logo-png`,
                details: {
                  size: 37313,
                  image: {
                    width: 2000,
                    height: 555,
                  },
                },
                fileName: `Gatsby_Logo-png`,
                contentType: `image/png`,
              },
            },
          },
        },
      ],
      deletedEntries: [],
      deletedAssets: [],
      nextSyncToken: `dDFSNcK6bMO7woHDuMK7A8O_KWQDPl1Kw7TDkX_CvcOnwrBpwqnDqR7Ci8OSHURla8OTIQYqZD_Cl2F6ZcK5TcKMwp8hw7fDojYtLTkUwofCisKjwrvDu1AxPsOMPMK9KyPDoiXDlnrDuWfCqXJzWsO-`,
    },
    tagItems: [],
    defaultLocale: `en-US`,
    locales: [
      {
        code: `en-US`,
        name: `English (United States)`,
        default: true,
        fallbackCode: null,
        sys: {
          id: `5lKTAsR93lyeuMvcgKno5T`,
          type: `Locale`,
          version: 1,
        },
      },
      {
        code: `nl`,
        name: `Dutch`,
        default: false,
        fallbackCode: null,
        sys: {
          id: `6VMQWqPJPxb8RZf93jGdvQ`,
          type: `Locale`,
          version: 1,
        },
      },
    ],
    space: {
      sys: {
        type: `Space`,
        id: `gher8kc6pxn0`,
      },
      name: `Gatsby Test Preview API`,
      locales: [
        {
          code: `en-US`,
          default: true,
          name: `English (United States)`,
          fallbackCode: null,
        },
        {
          code: `nl`,
          default: false,
          name: `Dutch`,
          fallbackCode: null,
        },
      ],
    },
  }
}

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
      id: `typeWithTextField`,
      type: `ContentType`,
      createdAt: `2022-04-07T12:36:29.252Z`,
      updatedAt: `2022-04-07T12:51:05.868Z`,
      environment: {
        sys: {
          id: `master`,
          type: `Link`,
          linkType: `Environment`,
        },
      },
      revision: 4,
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
            id: `ffDHCCwSEeozSX521OENf`,
            type: `Entry`,
            createdAt: `2022-04-07T12:41:07.377Z`,
            updatedAt: `2022-04-07T12:55:23.315Z`,
            environment: {
              sys: {
                id: `master`,
                type: `Link`,
                linkType: `Environment`,
              },
            },
            revision: 2,
            contentType: {
              sys: {
                type: `Link`,
                linkType: `ContentType`,
                id: `typeWithTextField`,
              },
            },
          },
          fields: {
            title: {
              "en-US": `Published With Valid Changes`,
            },
            textFieldNotRequired: {
              "en-US": `This value is not required.`,
            },
            textFieldRequired: {
              "en-US": `This value is required.`,
            },
            localizedTextFieldRequired: {
              "en-US": `This value is required.`,
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
            id: `3PmbzmeujVtZ9DzWb8gKC6`,
            type: `Entry`,
            createdAt: `2022-04-07T12:41:35.787Z`,
            updatedAt: `2022-04-07T12:54:46.551Z`,
            environment: {
              sys: {
                id: `master`,
                type: `Link`,
                linkType: `Environment`,
              },
            },
            revision: 3,
            contentType: {
              sys: {
                type: `Link`,
                linkType: `ContentType`,
                id: `typeWithTextField`,
              },
            },
          },
          fields: {
            title: {
              "en-US": `Published With Invalid Changes`,
            },
            textFieldNotRequired: {
              "en-US": `This value is not required.`,
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
            id: `5bVDAzKgE3EcBQChWzYKWD`,
            type: `Entry`,
            createdAt: `2022-04-07T12:40:02.490Z`,
            updatedAt: `2022-04-07T12:51:59.500Z`,
            environment: {
              sys: {
                id: `master`,
                type: `Link`,
                linkType: `Environment`,
              },
            },
            revision: 2,
            contentType: {
              sys: {
                type: `Link`,
                linkType: `ContentType`,
                id: `typeWithTextField`,
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
            id: `GNeUY0UXLjICCg858dL4u`,
            type: `Asset`,
            createdAt: `2022-04-07T13:02:24.201Z`,
            updatedAt: `2022-04-07T13:02:24.201Z`,
            environment: {
              sys: {
                id: `master`,
                type: `Link`,
                linkType: `Environment`,
              },
            },
            revision: 1,
          },
          fields: {
            title: {
              "en-US": `Published With Invalid Changes`,
            },
            file: {
              "en-US": {
                url: `//images.ctfassets.net/gher8kc6pxn0/GNeUY0UXLjICCg858dL4u/e9be37dbd109c51598562267eb522d31/Gatsby_Monogram.png`,
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
            id: `63n9F33sETxyat165EXfiA`,
            type: `Asset`,
            createdAt: `2022-04-07T13:01:34.502Z`,
            updatedAt: `2022-04-07T13:01:34.502Z`,
            environment: {
              sys: {
                id: `master`,
                type: `Link`,
                linkType: `Environment`,
              },
            },
            revision: 1,
          },
          fields: {
            title: {
              "en-US": `Published With Valid Changes`,
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
            id: `5lDlIqBwlFPGJNoeaImMd3`,
            type: `Asset`,
            createdAt: `2022-04-07T13:00:29.381Z`,
            updatedAt: `2022-04-07T13:00:29.381Z`,
            environment: {
              sys: {
                id: `master`,
                type: `Link`,
                linkType: `Environment`,
              },
            },
            revision: 1,
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
      nextSyncToken: `dDFSNcK6bMO7woHDuMK7A8O_KWQDPl1Kw7TDkX_CvcOnwrBpwqnDqR7Ci8OSHURwNsK4wrZaw4pzwqllPw1zA2AJdMKfw7pte8OSPwNBwoNqw6DCrMKiNUVgw58TWcKYw61pWAFew4fCjMKWwrbCl2DCjA`,
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

exports.contentTypeItems = () => [
  {
    sys: {
      space: {
        sys: {
          type: `Link`,
          linkType: `Space`,
          id: `8itggr1zebzx`,
        },
      },
      id: `blogPost`,
      type: `ContentType`,
      createdAt: `2023-01-11T14:52:56.250Z`,
      updatedAt: `2023-01-11T14:54:56.940Z`,
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
    name: `Blog Post`,
    description: ``,
    fields: [
      {
        id: `title`,
        name: `Title`,
        type: `Symbol`,
        localized: false,
        required: true,
        disabled: false,
        omitted: false,
      },
      {
        id: `slug`,
        name: `Slug`,
        type: `Symbol`,
        localized: false,
        required: true,
        disabled: false,
        omitted: false,
      },
      {
        id: `body`,
        name: `Body`,
        type: `Text`,
        localized: false,
        required: true,
        disabled: false,
        omitted: false,
      },
      {
        id: `category`,
        name: `Category`,
        type: `Link`,
        localized: false,
        required: false,
        disabled: false,
        omitted: false,
        linkType: `Entry`,
        validations: [
          {
            linkContentType: [`blogCategory`],
          },
        ],
      },
    ],
  },
  {
    sys: {
      space: {
        sys: {
          type: `Link`,
          linkType: `Space`,
          id: `8itggr1zebzx`,
        },
      },
      id: `blogCategory`,
      type: `ContentType`,
      createdAt: `2023-01-11T14:54:22.680Z`,
      updatedAt: `2023-01-11T14:54:22.680Z`,
      environment: {
        sys: {
          id: `master`,
          type: `Link`,
          linkType: `Environment`,
        },
      },
      revision: 1,
    },
    displayField: `title`,
    name: `Blog Category`,
    description: ``,
    fields: [
      {
        id: `title`,
        name: `Title`,
        type: `Symbol`,
        localized: false,
        required: true,
        disabled: false,
        omitted: false,
      },
      {
        id: `slug`,
        name: `Slug`,
        type: `Symbol`,
        localized: false,
        required: true,
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
                id: `8itggr1zebzx`,
              },
            },
            id: `3jXBlUgXmubzPI3I6d9hLr`,
            type: `Entry`,
            createdAt: `2023-01-11T14:56:37.418Z`,
            updatedAt: `2023-01-11T15:04:37.640Z`,
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
                id: `blogCategory`,
              },
            },
          },
          fields: {
            title: {
              "en-US": `CMS`,
            },
            slug: {
              "en-US": `cms`,
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
                id: `8itggr1zebzx`,
              },
            },
            id: `3oTFYoNKoVZcp8svbn8P2z`,
            type: `Entry`,
            createdAt: `2023-01-11T14:56:42.655Z`,
            updatedAt: `2023-01-11T14:56:42.655Z`,
            environment: {
              sys: {
                id: `master`,
                type: `Link`,
                linkType: `Environment`,
              },
            },
            revision: 1,
            contentType: {
              sys: {
                type: `Link`,
                linkType: `ContentType`,
                id: `blogPost`,
              },
            },
          },
          fields: {
            title: {
              "en-US": `Hello World`,
            },
            slug: {
              "en-US": `hello-world`,
            },
            body: {
              "en-US": `Lorem ipsum`,
            },
            category: {
              "en-US": {
                sys: {
                  type: `Link`,
                  linkType: `Entry`,
                  id: `3jXBlUgXmubzPI3I6d9hLr`,
                },
              },
            },
          },
        },
      ],
      assets: [],
      deletedEntries: [],
      deletedAssets: [],
      nextSyncToken: `dDFSNcK6bMO7woHDuMK7A8O_KWQDPkhAwpF6w7ovw49fQjrDj2gKH0xvwofCkMKDJcKgBMKCYcK9wr3DoVozwqEUC8OwWlVJBBt-F8K0BMKTP8OAwr8Xw6bCkcO2w6MpwqBmVX7CmsOwM3DDvWZvw5Q`,
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
          id: `2jpGtQkqT01zpSIqC9UQOS`,
          type: `Locale`,
          version: 1,
        },
      },
    ],
    space: {
      sys: {
        type: `Space`,
        id: `8itggr1zebzx`,
      },
      name: `test`,
      locales: [
        {
          code: `en-US`,
          default: true,
          name: `English (United States)`,
          fallbackCode: null,
        },
      ],
    },
  }
}

exports.editJustEntryWithBackLinks = () => {
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
                id: `8itggr1zebzx`,
              },
            },
            id: `3jXBlUgXmubzPI3I6d9hLr`,
            type: `Entry`,
            createdAt: `2023-01-11T14:56:37.418Z`,
            updatedAt: `2023-01-11T15:06:18.306Z`,
            environment: {
              sys: {
                id: `master`,
                type: `Link`,
                linkType: `Environment`,
              },
            },
            revision: 4,
            contentType: {
              sys: {
                type: `Link`,
                linkType: `ContentType`,
                id: `blogCategory`,
              },
            },
          },
          fields: {
            title: {
              "en-US": `CMS edit #1`,
            },
            slug: {
              "en-US": `cms`,
            },
          },
        },
      ],
      assets: [],
      deletedEntries: [],
      deletedAssets: [],
      nextSyncToken: `dDFSNcK6bMO7woHDuMK7A8O_KWQDPkhAwpF6w7ovw49fQjrDj2gKH0xvQMODwpLDkMK3Oj9Jw6jDkSoBMkc4woTCtMOFwoTDisKlT8O1w4AaKsOjasK1wrVSwrU3YsKVE8KPVMKyw4_CmVpwPsOew4IVwoA`,
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
          id: `2jpGtQkqT01zpSIqC9UQOS`,
          type: `Locale`,
          version: 1,
        },
      },
    ],
    space: {
      sys: {
        type: `Space`,
        id: `8itggr1zebzx`,
      },
      name: `test`,
      locales: [
        {
          code: `en-US`,
          default: true,
          name: `English (United States)`,
          fallbackCode: null,
        },
      ],
    },
  }
}

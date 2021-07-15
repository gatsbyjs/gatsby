exports.initialSync = () => {
  return {
    currentSyncData: {
      entries: [],
      assets: [],
      deletedEntries: [],
      deletedAssets: [],
      nextSyncToken: `12345`,
    },
    contentTypeItems: [
      {
        sys: {
          space: {
            sys: {
              type: `Link`,
              linkType: `Space`,
              id: `uzfinxahlog0`,
              contentful_id: `uzfinxahlog0`,
            },
          },
          id: `reference`,
          type: `ContentType`,
          createdAt: `2020-06-03T14:17:18.696Z`,
          updatedAt: `2020-06-03T14:17:18.696Z`,
          environment: {
            sys: {
              id: `master`,
              type: `Link`,
              linkType: `Environment`,
            },
          },
          revision: 1,
          contentful_id: `person`,
        },
        displayField: `name`,
        name: `Reference`,
        description: ``,
        fields: [
          {
            id: `name`,
            name: `Name`,
            type: `Symbol`,
            localized: false,
            required: true,
            disabled: false,
            omitted: false,
          },
        ],
      },
    ],
    defaultLocale: `en-US`,
    locales: [
      {
        code: `en-US`,
        name: `English (United States)`,
        default: true,
        fallbackCode: null,
        sys: {
          id: `1uSElBQA68GRKF30tpTxxT`,
          type: `Locale`,
          version: 1,
        },
      },
    ],
    space: {
      sys: { type: `Space`, id: `uzfinxahlog0` },
      name: `Starter Gatsby Blog`,
      locales: [
        {
          code: `en-US`,
          default: true,
          name: `English (United States)`,
          fallbackCode: null,
        },
      ],
    },
    tagItems: [],
  }
}

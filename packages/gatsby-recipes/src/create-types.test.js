import createTypes from "./create-types"

test(`create-types`, () => {
  const result = createTypes()
  expect(result.mutationTypes).toMatchInlineSnapshot(`
    Object {
      "createContentfulEntry": Object {
        "args": Object {
          "contentfulEntry": Object {
            "type": "ContentfulEntryInput",
          },
        },
        "resolve": [Function],
        "type": "ContentfulEntry",
      },
      "createContentfulEnvironment": Object {
        "args": Object {
          "contentfulEnvironment": Object {
            "type": "ContentfulEnvironmentInput",
          },
        },
        "resolve": [Function],
        "type": "ContentfulEnvironment",
      },
      "createContentfulSpace": Object {
        "args": Object {
          "contentfulSpace": Object {
            "type": "ContentfulSpaceInput",
          },
        },
        "resolve": [Function],
        "type": "ContentfulSpace",
      },
      "createContentfulType": Object {
        "args": Object {
          "contentfulType": Object {
            "type": "ContentfulTypeInput",
          },
        },
        "resolve": [Function],
        "type": "ContentfulType",
      },
      "createDirectory": Object {
        "args": Object {
          "directory": Object {
            "type": "DirectoryInput",
          },
        },
        "resolve": [Function],
        "type": "Directory",
      },
      "createFile": Object {
        "args": Object {
          "file": Object {
            "type": "FileInput",
          },
        },
        "resolve": [Function],
        "type": "File",
      },
      "createGatsbyPage": Object {
        "args": Object {
          "gatsbyPage": Object {
            "type": "GatsbyPageInput",
          },
        },
        "resolve": [Function],
        "type": "GatsbyPage",
      },
      "createGatsbyPlugin": Object {
        "args": Object {
          "gatsbyPlugin": Object {
            "type": "GatsbyPluginInput",
          },
        },
        "resolve": [Function],
        "type": "GatsbyPlugin",
      },
      "createGatsbyShadowFile": Object {
        "args": Object {
          "gatsbyShadowFile": Object {
            "type": "GatsbyShadowFileInput",
          },
        },
        "resolve": [Function],
        "type": "GatsbyShadowFile",
      },
      "createGatsbySiteMetadata": Object {
        "args": Object {
          "gatsbySiteMetadata": Object {
            "type": "GatsbySiteMetadataInput",
          },
        },
        "resolve": [Function],
        "type": "GatsbySiteMetadata",
      },
      "createGitIgnore": Object {
        "args": Object {
          "gitIgnore": Object {
            "type": "GitIgnoreInput",
          },
        },
        "resolve": [Function],
        "type": "GitIgnore",
      },
      "createNpmPackage": Object {
        "args": Object {
          "npmPackage": Object {
            "type": "NPMPackageInput",
          },
        },
        "resolve": [Function],
        "type": "NPMPackage",
      },
      "createNpmPackageJson": Object {
        "args": Object {
          "npmPackageJson": Object {
            "type": "NPMPackageJsonInput",
          },
        },
        "resolve": [Function],
        "type": "NPMPackageJson",
      },
      "createNpmScript": Object {
        "args": Object {
          "npmScript": Object {
            "type": "NPMScriptInput",
          },
        },
        "resolve": [Function],
        "type": "NPMScript",
      },
      "destroyContentfulEntry": Object {
        "args": Object {
          "contentfulEntry": Object {
            "type": "ContentfulEntryInput",
          },
        },
        "resolve": [Function],
        "type": "ContentfulEntry",
      },
      "destroyContentfulEnvironment": Object {
        "args": Object {
          "contentfulEnvironment": Object {
            "type": "ContentfulEnvironmentInput",
          },
        },
        "resolve": [Function],
        "type": "ContentfulEnvironment",
      },
      "destroyContentfulSpace": Object {
        "args": Object {
          "contentfulSpace": Object {
            "type": "ContentfulSpaceInput",
          },
        },
        "resolve": [Function],
        "type": "ContentfulSpace",
      },
      "destroyContentfulType": Object {
        "args": Object {
          "contentfulType": Object {
            "type": "ContentfulTypeInput",
          },
        },
        "resolve": [Function],
        "type": "ContentfulType",
      },
      "destroyDirectory": Object {
        "args": Object {
          "directory": Object {
            "type": "DirectoryInput",
          },
        },
        "resolve": [Function],
        "type": "Directory",
      },
      "destroyFile": Object {
        "args": Object {
          "file": Object {
            "type": "FileInput",
          },
        },
        "resolve": [Function],
        "type": "File",
      },
      "destroyGatsbyPage": Object {
        "args": Object {
          "gatsbyPage": Object {
            "type": "GatsbyPageInput",
          },
        },
        "resolve": [Function],
        "type": "GatsbyPage",
      },
      "destroyGatsbyPlugin": Object {
        "args": Object {
          "gatsbyPlugin": Object {
            "type": "GatsbyPluginInput",
          },
        },
        "resolve": [Function],
        "type": "GatsbyPlugin",
      },
      "destroyGatsbyShadowFile": Object {
        "args": Object {
          "gatsbyShadowFile": Object {
            "type": "GatsbyShadowFileInput",
          },
        },
        "resolve": [Function],
        "type": "GatsbyShadowFile",
      },
      "destroyGatsbySiteMetadata": Object {
        "args": Object {
          "gatsbySiteMetadata": Object {
            "type": "GatsbySiteMetadataInput",
          },
        },
        "resolve": [Function],
        "type": "GatsbySiteMetadata",
      },
      "destroyGitIgnore": Object {
        "args": Object {
          "gitIgnore": Object {
            "type": "GitIgnoreInput",
          },
        },
        "resolve": [Function],
        "type": "GitIgnore",
      },
      "destroyNpmPackage": Object {
        "args": Object {
          "npmPackage": Object {
            "type": "NPMPackageInput",
          },
        },
        "resolve": [Function],
        "type": "NPMPackage",
      },
      "destroyNpmPackageJson": Object {
        "args": Object {
          "npmPackageJson": Object {
            "type": "NPMPackageJsonInput",
          },
        },
        "resolve": [Function],
        "type": "NPMPackageJson",
      },
      "destroyNpmScript": Object {
        "args": Object {
          "npmScript": Object {
            "type": "NPMScriptInput",
          },
        },
        "resolve": [Function],
        "type": "NPMScript",
      },
      "updateContentfulEntry": Object {
        "args": Object {
          "contentfulEntry": Object {
            "type": "ContentfulEntryInput",
          },
        },
        "resolve": [Function],
        "type": "ContentfulEntry",
      },
      "updateContentfulEnvironment": Object {
        "args": Object {
          "contentfulEnvironment": Object {
            "type": "ContentfulEnvironmentInput",
          },
        },
        "resolve": [Function],
        "type": "ContentfulEnvironment",
      },
      "updateContentfulSpace": Object {
        "args": Object {
          "contentfulSpace": Object {
            "type": "ContentfulSpaceInput",
          },
        },
        "resolve": [Function],
        "type": "ContentfulSpace",
      },
      "updateContentfulType": Object {
        "args": Object {
          "contentfulType": Object {
            "type": "ContentfulTypeInput",
          },
        },
        "resolve": [Function],
        "type": "ContentfulType",
      },
      "updateDirectory": Object {
        "args": Object {
          "directory": Object {
            "type": "DirectoryInput",
          },
        },
        "resolve": [Function],
        "type": "Directory",
      },
      "updateFile": Object {
        "args": Object {
          "file": Object {
            "type": "FileInput",
          },
        },
        "resolve": [Function],
        "type": "File",
      },
      "updateGatsbyPage": Object {
        "args": Object {
          "gatsbyPage": Object {
            "type": "GatsbyPageInput",
          },
        },
        "resolve": [Function],
        "type": "GatsbyPage",
      },
      "updateGatsbyPlugin": Object {
        "args": Object {
          "gatsbyPlugin": Object {
            "type": "GatsbyPluginInput",
          },
        },
        "resolve": [Function],
        "type": "GatsbyPlugin",
      },
      "updateGatsbyShadowFile": Object {
        "args": Object {
          "gatsbyShadowFile": Object {
            "type": "GatsbyShadowFileInput",
          },
        },
        "resolve": [Function],
        "type": "GatsbyShadowFile",
      },
      "updateGatsbySiteMetadata": Object {
        "args": Object {
          "gatsbySiteMetadata": Object {
            "type": "GatsbySiteMetadataInput",
          },
        },
        "resolve": [Function],
        "type": "GatsbySiteMetadata",
      },
      "updateGitIgnore": Object {
        "args": Object {
          "gitIgnore": Object {
            "type": "GitIgnoreInput",
          },
        },
        "resolve": [Function],
        "type": "GitIgnore",
      },
      "updateNpmPackage": Object {
        "args": Object {
          "npmPackage": Object {
            "type": "NPMPackageInput",
          },
        },
        "resolve": [Function],
        "type": "NPMPackage",
      },
      "updateNpmPackageJson": Object {
        "args": Object {
          "npmPackageJson": Object {
            "type": "NPMPackageJsonInput",
          },
        },
        "resolve": [Function],
        "type": "NPMPackageJson",
      },
      "updateNpmScript": Object {
        "args": Object {
          "npmScript": Object {
            "type": "NPMScriptInput",
          },
        },
        "resolve": [Function],
        "type": "NPMScript",
      },
    }
  `)
  expect(result.queryTypes).toMatchInlineSnapshot(`
    Object {
      "allContentfulEntry": Object {
        "resolve": [Function],
        "type": "ContentfulEntryConnection",
      },
      "allContentfulEnvironment": Object {
        "resolve": [Function],
        "type": "ContentfulEnvironmentConnection",
      },
      "allContentfulSpace": Object {
        "resolve": [Function],
        "type": "ContentfulSpaceConnection",
      },
      "allContentfulType": Object {
        "resolve": [Function],
        "type": "ContentfulTypeConnection",
      },
      "allGatsbyPage": Object {
        "resolve": [Function],
        "type": "GatsbyPageConnection",
      },
      "allGatsbyPlugin": Object {
        "resolve": [Function],
        "type": "GatsbyPluginConnection",
      },
      "allGatsbySiteMetadata": Object {
        "resolve": [Function],
        "type": "GatsbySiteMetadataConnection",
      },
      "allGitIgnore": Object {
        "resolve": [Function],
        "type": "GitIgnoreConnection",
      },
      "allNPMPackageJson": Object {
        "resolve": [Function],
        "type": "NPMPackageJsonConnection",
      },
      "allNPMScript": Object {
        "resolve": [Function],
        "type": "NPMScriptConnection",
      },
      "contentfulEntry": Object {
        "args": Object {
          "id": Object {
            "type": "String",
          },
        },
        "resolve": [Function],
        "type": "ContentfulEntry",
      },
      "contentfulEnvironment": Object {
        "args": Object {
          "id": Object {
            "type": "String",
          },
        },
        "resolve": [Function],
        "type": "ContentfulEnvironment",
      },
      "contentfulSpace": Object {
        "args": Object {
          "id": Object {
            "type": "String",
          },
        },
        "resolve": [Function],
        "type": "ContentfulSpace",
      },
      "contentfulType": Object {
        "args": Object {
          "id": Object {
            "type": "String",
          },
        },
        "resolve": [Function],
        "type": "ContentfulType",
      },
      "directory": Object {
        "args": Object {
          "id": Object {
            "type": "String",
          },
        },
        "resolve": [Function],
        "type": "Directory",
      },
      "file": Object {
        "args": Object {
          "id": Object {
            "type": "String",
          },
        },
        "resolve": [Function],
        "type": "File",
      },
      "gatsbyPage": Object {
        "args": Object {
          "id": Object {
            "type": "String",
          },
        },
        "resolve": [Function],
        "type": "GatsbyPage",
      },
      "gatsbyPlugin": Object {
        "args": Object {
          "id": Object {
            "type": "String",
          },
        },
        "resolve": [Function],
        "type": "GatsbyPlugin",
      },
      "gatsbyShadowFile": Object {
        "args": Object {
          "id": Object {
            "type": "String",
          },
        },
        "resolve": [Function],
        "type": "GatsbyShadowFile",
      },
      "gatsbySiteMetadata": Object {
        "args": Object {
          "id": Object {
            "type": "String",
          },
        },
        "resolve": [Function],
        "type": "GatsbySiteMetadata",
      },
      "gitIgnore": Object {
        "args": Object {
          "id": Object {
            "type": "String",
          },
        },
        "resolve": [Function],
        "type": "GitIgnore",
      },
      "npmPackage": Object {
        "args": Object {
          "id": Object {
            "type": "String",
          },
        },
        "resolve": [Function],
        "type": "NPMPackage",
      },
      "npmPackageJson": Object {
        "args": Object {
          "id": Object {
            "type": "String",
          },
        },
        "resolve": [Function],
        "type": "NPMPackageJson",
      },
      "npmScript": Object {
        "args": Object {
          "id": Object {
            "type": "String",
          },
        },
        "resolve": [Function],
        "type": "NPMScript",
      },
    }
  `)
})

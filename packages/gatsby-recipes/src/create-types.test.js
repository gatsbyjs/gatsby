const createTypes = require(`./create-types`)

test(`create-types`, () => {
  const result = createTypes()
  expect(result.mutationTypes).toMatchInlineSnapshot(`
    Object {
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
      "allGatsbyPlugin": Object {
        "resolve": [Function],
        "type": "GatsbyPluginConnection",
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

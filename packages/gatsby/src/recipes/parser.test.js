const fs = require(`fs-extra`)
const path = require(`path`)

const parser = require(`./parser`)

const fixturePath = path.join(__dirname, `prettier-git-hook.mdx`)
const fixtureSrc = fs.readFileSync(fixturePath, `utf8`)

test(`returns a set of commands`, () => {
  const result = parser(fixtureSrc)

  expect(result.commands).toMatchInlineSnapshot(`
    Array [
      Object {},
      Object {
        "NPMPackage": Array [
          Object {
            "name": "husky",
          },
          Object {
            "name": "prettier",
          },
          Object {
            "name": "lint-staged",
          },
        ],
      },
      Object {
        "NPMPackageJson": Array [
          Object {
            "name": "husky",
            "value": Object {
              "hooks": Object {
                "pre-commit": "lint-staged",
              },
            },
          },
          Object {
            "name": "lint-staged",
            "value": Object {
              "*.{js,md,mdx,json}": Array [
                "prettier --write",
              ],
            },
          },
        ],
      },
      Object {
        "File": Array [
          Object {
            "content": "{
      \\"semi\\": false,
      \\"singleQuote\\": true,
      \\"trailingComma\\": \\"none\\"
    }",
            "path": ".prettierrc",
          },
          Object {
            "content": ".cache
    public
    node_modules
    ",
            "path": ".prettierignore",
          },
        ],
      },
      Object {},
    ]
  `)
})

test(`partitions the MDX into steps`, () => {
  const result = parser(fixtureSrc)

  expect(result.stepsAsMdx).toMatchInlineSnapshot(`
    Array [
      "# Prettier Git Hook

    Make sure all of your code is run through prettier when you commit it to git.
    We achieve this by configuring prettier to run on git hooks using husky and
    lint-staged.
    ",
      "Install packages.

    <NPMPackage name=\\"husky\\" />
    <NPMPackage name=\\"prettier\\" />
    <NPMPackage name=\\"lint-staged\\" />
    ",
      "Implement git hooks for prettier.

    <NPMPackageJson
      name=\\"husky\\"
      value={{
        \\"hooks\\": {
          \\"pre-commit\\": \\"lint-staged\\"
        }
      }}
    />
    <NPMPackageJson
      name=\\"lint-staged\\"
      value={{
        \\"*.{js,md,mdx,json}\\": [
          \\"prettier --write\\"
        ]
      }}
    />
    ",
      "Write prettier config files.

    <File
      path=\\".prettierrc\\"
      content={\`{
      \\"semi\\": false,
      \\"singleQuote\\": true,
      \\"trailingComma\\": \\"none\\"
    }\`}
    />
    <File
      path=\\".prettierignore\\"
      content={\`.cache
    public
    node_modules
    \`}
    />
    ",
      "Prettier, husky, and lint-staged are now installed! You can edit your \`.prettierrc\`
    if you'd like to change your prettier configuration.
    ",
    ]
  `)
})

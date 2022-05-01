#!/usr/bin/env node
"use strict"
const fs = require(`fs`)
const path = require(`path`)
const glob = require(`glob`)
const mkdirp = require(`mkdirp`)
const { sortBy, uniq } = require(`lodash`)
const babel = require(`@babel/core`)

const declare = require(`@babel/helper-plugin-utils`).declare

const loadThemes = require(`gatsby/dist/bootstrap/load-themes`)

const inquirer = require(`inquirer`)

inquirer
  .prompt([
    {
      type: `list`,
      name: `theme`,
      message: `What theme are you trying to eject from?`,
      choices: async () => {
        const config = require(path.join(
          process.cwd(),
          `gatsby-config.js`
        ), `utf-8`)

        const configWithThemes = await loadThemes(config, {
          useLegacyThemes: false,
        })

        return sortBy(
          uniq(configWithThemes.config.plugins.map(({ resolve }) => resolve))
        )
      },
    },
    {
      type: `list`,
      name: `component`,
      message: `Select the file you would like to shadow:`,
      choices: ({ theme }) => {
        const themeSrc = path.join(path.dirname(require.resolve(theme)), `src`)
        return glob.sync(`**/*`, {
          cwd: themeSrc,
        })
      },
    },
    {
      type: `list`,
      name: `shadowType`,
      message: `Would you like to copy or extend?`,
      choices: [`copy`, `extend`],
    },
  ])
  .then(({ theme, component, shadowType }) => {
    const componentPath = path.dirname(component)
    mkdirp.sync(path.join(process.cwd(), `src`, theme, componentPath))
    const finalPath = path.join(process.cwd(), `src`, theme, component)

    if (shadowType === `copy`) {
      const componentFromThemePath = path.join(
        path.dirname(require.resolve(theme)),
        `src`,
        component
      )
      const npmModuleComponentImport = path.join(theme, `src`, component)

      const { ext } = path.parse(component)

      if ([`.js`, `.jsx`].includes(ext)) {
        // apply babel relative path transformations
        const instance = new BabelPluginTransformRelativeImports({
          originalComponentPath: npmModuleComponentImport,
        })
        // Read the component file in preparation for transforming relative file imports
        const componentCodeString = fs.readFileSync(componentFromThemePath)

        const result = babel.transform(componentCodeString, {
          configFile: false,
          plugins: [instance.plugin, require(`@babel/plugin-syntax-jsx`)],
        })
        fs.writeFileSync(finalPath, result.code)
      } else {
        // if we don't know how to process the file type, just copy it
        // and let the user decide what to do
        fs.copyFileSync(componentFromThemePath, finalPath)
      }
    } else if (shadowType === `extend`) {
      fs.writeFileSync(
        finalPath,
        `import Component from '${theme}/src/${component}';
export default props => <Component {...props}/>`
      )
    }
  })

class BabelPluginTransformRelativeImports {
  // originalComponentPath is the path from the node module to the component
  constructor({ originalComponentPath }) {
    this.plugin = declare(api => {
      api.assertVersion(7)

      return {
        visitor: {
          StringLiteral({ node }) {
            const split = node.value.split(`!`)
            const nodePath = split.pop()
            const loaders = `${split.join(`!`)}${split.length > 0 ? `!` : ``}`

            if (nodePath.startsWith(`.`)) {
              console.log(originalComponentPath, nodePath)
              const valueAbsPath = path.resolve(originalComponentPath, nodePath)
              const replacementPath =
                loaders +
                path.join(path.dirname(originalComponentPath), nodePath)
              node.value = replacementPath
            }
          },
        },
      }
    })
  }
}

// TODO update these for v2 and restore theme functionality.
// describe(`gatsby-plugin-less`, () => {
// jest.mock(`extract-text-webpack-plugin`, () => {
// return {
// extract(...args) {
// return { extractTextCalledWithArgs: args }
// },
// }
// })
// const filePathTheme = `./packages/gatsby-plugin-less/src/theme-test.js`

// const { modifyWebpackConfig } = require(`../gatsby-node`)
// const cssLoader = expect.stringMatching(/^css/)

// const lessLoaderDevNoVars = `less?{"sourceMap":true}`
// const lessLoaderProdNoVars = `less`

// const lessLoaderDevVars = `less?{"sourceMap":true,"modifyVars":{"text-color":"#fff"}}`
// const lessLoaderProdVars = `less?{"modifyVars":{"text-color":"#fff"}}`
// ;[
// {
// stages: [`develop`],
// loaderKeys: [`less`, `lessModules`],
// loaderConfig: {
// loaders: expect.arrayContaining([cssLoader, lessLoaderDevVars]),
// },
// options: {
// theme: {
// "text-color": `#fff`,
// },
// },
// },
// {
// stages: [`build-css`],
// loaderKeys: [`less`, `lessModules`],
// loaderConfig: {
// loader: {
// extractTextCalledWithArgs: expect.arrayContaining([
// expect.arrayContaining([cssLoader, lessLoaderProdVars]),
// ]),
// },
// },
// options: {
// theme: {
// "text-color": `#fff`,
// },
// },
// },
// {
// stages: [`develop-html`, `build-html`, `build-javascript`],
// loaderKeys: [`lessModules`],
// loaderConfig: {
// loader: {
// extractTextCalledWithArgs: expect.arrayContaining([
// expect.arrayContaining([cssLoader, lessLoaderProdVars]),
// ]),
// },
// },
// options: {
// theme: {
// "text-color": `#fff`,
// },
// },
// },
// ].forEach(({ stages, loaderKeys, loaderConfig, options }) => {
// stages.forEach(stage => {
// it(`modifies webpack config with theme object for stage: ${stage}`, () => {
// const config = { loader: jest.fn() }
// const modified = modifyWebpackConfig({ config, stage }, options)

// expect(modified).toBe(config)

// loaderKeys.forEach(loaderKey =>
// expect(config.loader).toBeCalledWith(
// loaderKey,
// expect.objectContaining(loaderConfig)
// )
// )
// })
// })
// })
// ;[
// {
// stages: [`develop`],
// loaderKeys: [`less`, `lessModules`],
// loaderConfig: {
// loaders: expect.arrayContaining([cssLoader, lessLoaderDevVars]),
// },
// options: {
// theme: filePathTheme,
// },
// },
// {
// stages: [`build-css`],
// loaderKeys: [`less`, `lessModules`],
// loaderConfig: {
// loader: {
// extractTextCalledWithArgs: expect.arrayContaining([
// expect.arrayContaining([cssLoader, lessLoaderProdVars]),
// ]),
// },
// },
// options: {
// theme: filePathTheme,
// },
// },
// {
// stages: [`develop-html`, `build-html`, `build-javascript`],
// loaderKeys: [`lessModules`],
// loaderConfig: {
// loader: {
// extractTextCalledWithArgs: expect.arrayContaining([
// expect.arrayContaining([cssLoader, lessLoaderProdVars]),
// ]),
// },
// },
// options: {
// theme: filePathTheme,
// },
// },
// ].forEach(({ stages, loaderKeys, loaderConfig, options }) => {
// stages.forEach(stage => {
// it(`modifies webpack config with theme path for stage: ${stage}`, () => {
// const config = { loader: jest.fn() }
// const modified = modifyWebpackConfig({ config, stage }, options)

// expect(modified).toBe(config)

// loaderKeys.forEach(loaderKey =>
// expect(config.loader).toBeCalledWith(
// loaderKey,
// expect.objectContaining(loaderConfig)
// )
// )
// })
// })
// })
// ;[
// {
// stages: [`develop`],
// loaderKeys: [`less`, `lessModules`],
// loaderConfig: {
// loaders: expect.arrayContaining([cssLoader, lessLoaderDevNoVars]),
// },
// },
// {
// stages: [`build-css`],
// loaderKeys: [`less`, `lessModules`],
// loaderConfig: {
// loader: {
// extractTextCalledWithArgs: expect.arrayContaining([
// expect.arrayContaining([cssLoader, lessLoaderProdNoVars]),
// ]),
// },
// },
// },
// {
// stages: [`develop-html`, `build-html`, `build-javascript`],
// loaderKeys: [`lessModules`],
// loaderConfig: {
// loader: {
// extractTextCalledWithArgs: expect.arrayContaining([
// expect.arrayContaining([cssLoader, lessLoaderProdNoVars]),
// ]),
// },
// },
// },
// ].forEach(({ stages, loaderKeys, loaderConfig }) => {
// stages.forEach(stage => {
// it(`modifies webpack config without options for stage: ${stage}`, () => {
// const config = { loader: jest.fn() }
// const modified = modifyWebpackConfig({ config, stage }, {})

// expect(modified).toBe(config)

// loaderKeys.forEach(loaderKey =>
// expect(config.loader).toBeCalledWith(
// loaderKey,
// expect.objectContaining(loaderConfig)
// )
// )
// })
// })
// })
// })

module.exports = {
  presets: [[`babel-preset-gatsby-package`]],
  plugins: [
    [
      `@babel/plugin-proposal-private-methods`,
      {
        loose: true,
      },
    ],
    [
      `babel-plugin-module-resolver`,
      {
        alias: {
          "~": `./src`,
        },
      },
    ],
    [
      `@babel/plugin-proposal-class-properties`,
      {
        loose: true,
      },
    ],
    [
      `import-globals`,
      {
        dd: {
          moduleName: `dumper.js`,
          exportName: `dd`,
        },
        dump: {
          moduleName: `dumper.js`,
          exportName: `dump`,
        },
        clipboardy: {
          moduleName: `clipboardy`,
          exportName: `default`,
        },
      },
    ],
  ],
  "overrides": [
    {
      "test": ["**/src/gatsby-browser.ts"],
      "presets": [["babel-preset-gatsby-package", { "browser": true, "esm": true }]]
    }
  ]
}

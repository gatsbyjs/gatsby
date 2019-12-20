const TSEslint = require("@typescript-eslint/eslint-plugin")

module.exports = {
  parser: "babel-eslint",
  extends: [
    "google",
    "eslint:recommended",
    "plugin:flowtype/recommended",
    "plugin:react/recommended",
    "prettier",
    "prettier/flowtype",
    "prettier/react",
  ],
  plugins: ["flowtype", "prettier", "react", "filenames"],
  parserOptions: {
    ecmaVersion: 2016,
    sourceType: "module",
    ecmaFeatures: {
      jsx: true,
    },
  },
  env: {
    browser: true,
    es6: true,
    node: true,
    jest: true,
  },
  globals: {
    before: true,
    after: true,
    spyOn: true,
    __PATH_PREFIX__: true,
    __BASE_PATH__: true,
    __ASSET_PREFIX__: true,
  },
  rules: {
    "arrow-body-style": [
      "error",
      "as-needed",
      { requireReturnForObjectLiteral: true },
    ],
    "no-unused-expressions": [
      "error",
      {
        allowTaggedTemplates: true,
      },
    ],
    "consistent-return": ["error"],
    "filenames/match-regex": ["error", "^[a-z-\\d\\.]+$", true],
    "no-console": "off",
    "no-inner-declarations": "off",
    "prettier/prettier": "error",
    quotes: ["error", "backtick"],
    "react/display-name": "off",
    "react/jsx-key": "warn",
    "react/no-unescaped-entities": "off",
    "react/prop-types": "off",
    "require-jsdoc": "off",
    "valid-jsdoc": "off",
  },
  overrides: [
    {
      files: [
        "packages/**/gatsby-browser.js",
        "packages/gatsby/cache-dir/**/*",
      ],
      env: {
        browser: true,
      },
      globals: {
        ___loader: false,
        ___emitter: false,
      },
    },
    {
      files: ["**/cypress/integration/**/*", "**/cypress/support/**/*"],
      globals: {
        cy: false,
        Cypress: false,
      },
    },
    {
      files: ["*.ts", "*.tsx"],
      parser: "@typescript-eslint/parser",
      plugins: ["@typescript-eslint/eslint-plugin"],
      rules: {
        ...TSEslint.configs.recommended.rules,
        "@typescript-eslint/member-delimiter-style": [
          "error",
          {
            multiline: {
              delimiter: "none",
            },
          },
        ],
        "@typescript-eslint/interface-name-prefix": [
          "error",
          { prefixWithI: "always" },
        ],
        "@typescript-eslint/no-empty-function": "off",
        "@typescript-eslint/explicit-function-return-type": "error",
      },
    },
  ],
  settings: {
    react: {
      version: "16.4.2",
    },
  },
}

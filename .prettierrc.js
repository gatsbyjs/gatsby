module.exports = {
  semi: true,
  trailingComma: "all",
  tabWidth: 2,
  singleQuote: false,
  quoteProps: "as-needed",
  jsxSingleQuote: false,
  endOfLine: "lf",
  bracketSpacing: true,
  jsxSingleQuote: true,
  overrides: [
    {
      // This file uses semicolons. It's needed here because `documentation`
      // package (used to parse jsdoc and provide content for API reference pages)
      // behaviour is inconsistent when not using semicolons after
      // object declarations.
      files: ["**/api-node-helpers-docs.js"],
      options: {
        semi: true,
      },
    },
    {
      files: "docs/**/*.md",
      options: {
        parser: "mdx",
      },
    },
  ],
};

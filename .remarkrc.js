const fs = require("fs")
const unified = require("unified")

const dictionary = fs.readFileSync("./dictionary.txt")

module.exports = {
  options: {
    silentlyIgnore: true,
    quiet: true,
    frail: true,
    extensions: ["md"]
  },
  plugins: [
    ["remark-frontmatter", "yaml"],
    [
      "remark-retext",
      unified()
        .use(require("retext-english"))
        .use(require("retext-syntax-urls"))
        .use(require("retext-syntax-mentions"))
        .use(require("retext-emoji"))
        .use(require("retext-spell"), {
          dictionary: require("dictionary-en"),
          personal: dictionary,
        })
        .use(require("retext-diacritics"))
        .use(require("retext-indefinite-article"))
        .use(require("retext-redundant-acronyms"))
        .use(require("retext-sentence-spacing")),
    ],
    "remark-preset-lint-recommended",
    "remark-preset-lint-markdown-style-guide",

    // additional remark-lint rules
    ["remark-lint-list-item-indent", "space"],
    "remark-lint-no-duplicate-headings-in-section",
    "remark-lint-no-reference-like-url",
    ["remark-lint-ordered-list-marker-value", "ordered"],

    // We would like these rules to be enabled, but they require significant content changes
    // and need additional PRs to be implemented
    ["remark-lint-emphasis-marker", false],
    ["remark-lint-no-heading-punctuation", false],
    ["remark-lint-list-item-spacing", false],

    // The following rules are disabled because they are inconsistent to the
    // Gatsby Style Guide.

    // We use soft-wrapped paragraphs for ease of diffing/translation.
    ["remark-lint-maximum-line-length", false],
    // We don't restrict the length of headings.
    ["remark-lint-maximum-heading-length", false],
    // We use duplicate headings sometimes, e.g. multiple "Directions" in Recipes.
    // Use no-duplicate-headings-in-section instead.
    ["remark-lint-no-duplicate-headings", false],
    // We use emphasis as notes or warnings in a couple places, which triggers this rule.
    ["remark-lint-no-emphasis-as-heading", false],
    // YouTube and Giphy embeds in the docs use literal URLs.
    ["remark-lint-no-literal-urls", false],
    // We use `[shortcuts]` for convenience.
    ["remark-lint-no-shortcut-reference-link", false],
    // We use brackets in a lot of places as argument lists and do not want to escape them.
    ["remark-lint-no-undefined-references", false],
    ["remark-lint-first-heading-level", 2],
  ],
}

<p align="center">
  <a href="https://www.gatsbyjs.org">
    <img alt="Gatsby" src="https://www.gatsbyjs.org/monogram.svg" width="60" />
  </a>
</p>
<h1 align="center">
  The Gatsby notes theme
</h1>

A Gatsby theme for publishing notes to your website.

## Installation

### Use the notes theme starter

This will generate a new site that pre-configures use of the notes theme.

```shell
gatsby new my-themed-notes https://github.com/gatsbyjs/gatsby-starter-notes-theme
```

### Manually add to your site

```shell
npm install --save gatsby-theme-notes
```

## Usage

```js
// gatsby-config.js
module.exports = {
  plugins: [
    {
      resolve: `gatsby-theme-notes`,
      options: {
        // basePath defaults to `/`
        basePath: `/notes`,
      },
    },
  ],
}
```

### Options

| Key                   | Default value    | Description                                                                                               |
| --------------------- | ---------------- | --------------------------------------------------------------------------------------------------------- |
| `basePath`            | `/`              | Root url for all notes pages                                                                              |
| `contentPath`         | `/content/notes` | Location of notes content                                                                                 |
| `mdx`                 | `true`           | Configure `gatsby-plugin-mdx` (if your website already is using the plugin pass `false` to turn this off) |
| `homeText`            | `~`              | Root text for notes breadcrumb trail                                                                      |
| `breadcrumbSeparator` | `/`              | Separator for the breadcrumb trail                                                                        |

# gatsby-theme-notes

A Gatsby Theme for publishing notes to your website.

![image](https://user-images.githubusercontent.com/1424573/57794512-07bcd800-7701-11e9-8b09-4d275efeeb82.png)

## Installation

```sh
yarn add gatsby-theme-notes
```

## Usage

```js
// gatsby-config.js
module.exports = {
  __experimentalThemes: [
    {
      resolve: `gatsby-theme-notes`,
      options: {
        notesPath: `/txt`,
      },
    },
  ],
}
```

### Options

| Key                   | Default value | Description                                                                                      |
| --------------------- | ------------- | ------------------------------------------------------------------------------------------------ |
| `notesPath`           | `/notes`      | Root url for all notes pages                                                                     |
| `mdx`                 | `true`        | Configure `gatsby-mdx` (if your website already is using the plugin pass `false` to turn it off) |
| `homeText`            | `~`           | Root text for notes breadcrumb trail                                                             |
| `breadcrumbSeparator` | `/`           | Separator for the breadcrumb trail                                                               |

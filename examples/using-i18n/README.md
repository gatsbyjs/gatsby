# Using i18n

https://using-i18n.netlify.app/

Example site that demonstrates how to build Gatsby sites with multiple languages (Internationalization / i18n) without any third-party plugins or packages. Per language a dedicated page is built (so no client-side translations) which is among other things important for SEO.

The general information are defined in `config/i18n.js`, the translations are located in `config/translations`. The custom hook `useTranslations` pulls in these translations then (when the former is changed, the latter needs to update its GraphQL query). Due to the usage of a global layout/Context API and the passed `locale` to all pages (see `gatsby-node.js`) you know on every page which language is currently displayed. Moreover, with the usage of MDX and `gatsby-mdx` a custom component for the `<a>` tag is implemented -- this way links can stay the same for every language, without the need to manually write path prefixes.

**Opinionated choices that were made:**

- Usage of a custom hook with GraphQL to access translations. That part can be replaced with a i18n library
- Blogposts are defined in `blog`. The folder names are the `slug` of the page. Inside these folders there has to be an `index.mdx` file (for the default language). Any other language needs to be defined in the format `name-with-dashes.lang.mdx`

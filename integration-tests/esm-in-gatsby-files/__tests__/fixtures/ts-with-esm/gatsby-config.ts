//Import ESM-Only Packages
import slugify from "@sindresorhus/slugify";
import remarkGfm from "remark-gfm"
import rehypeSlug from "rehype-slug"

// Import ESM Modules
import helloDefaultESM from "./esm-default.mjs"
import { helloNamedESM } from "./esm-named.mjs"

helloDefaultESM()
helloNamedESM()

const config = {
  plugins: [
    {
      resolve: `a-local-plugin`,
      options: {
        slugify,
      },
    },
    {
      resolve: `gatsby-plugin-mdx`,
      options: {
        extensions: [`.mdx`, `.md`],
        gatsbyRemarkPlugins: [
          `gatsby-remark-images`,
          `gatsby-remark-autolink-headers`,
        ],
        mdxOptions: {
          remarkPlugins: [
            // This is an esm only packages, It should work out of the box
            remarkGfm,
          ],

          rehypePlugins: [
            // This is an esm only packages, It should work out of the box
            rehypeSlug,
          ],
        },
      },
    },
  ],
}

export default config

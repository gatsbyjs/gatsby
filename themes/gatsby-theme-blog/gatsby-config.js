const pkg = require("./package.json");

module.exports = {
  siteMetadata: {
    title: `My Blog Title`,
    author: `Your Name`,
    description: `coming soon...`,
    siteUrl: `https://github.com/amberleyromo/gatsby-themes/tree/master/packages/gatsby-theme-darklight-blog`,
    social: {
      twitter: `amber1ey`
    }
  },
  plugins: [
    /*
     * We need to make sure that Webpack processes this theme as ES6, so we add
     * this plugin and specify the package name in `modules`.
     */
    {
      resolve: "gatsby-plugin-compile-es6-packages",
      options: {
        modules: [pkg.name]
      }
    },
    /*
     * User override content
     */
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: "blog-posts",
        path: `content/posts`
      }
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: "blog-assets",
        path: `content/assets`
      }
    },
    /*
     * Default/demo posts
     */
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: "blog-default-posts",
        path: `${__dirname}/content/posts`
      }
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: "blog-default-assets",
        path: `${__dirname}/content/assets`
      }
    },
    {
      resolve: `gatsby-transformer-remark`,
      options: {
        plugins: [
          {
            resolve: `gatsby-remark-images`,
            options: {
              maxWidth: 590
            }
          },
          {
            resolve: `gatsby-remark-responsive-iframe`,
            options: {
              wrapperStyle: `margin-bottom: 1.0725rem`
            }
          },
          `gatsby-remark-prismjs`,
          `gatsby-remark-copy-linked-files`,
          `gatsby-remark-smartypants`,
          `gatsby-remark-autolink-headers`
        ]
      }
    },
    `gatsby-transformer-sharp`,
    `gatsby-plugin-sharp`,
    {
      resolve: `gatsby-mdx`,
      options: {
        extensions: [".mdx", ".md"],
        gatsbyRemarkPlugins: [
          {
            resolve: "gatsby-remark-images",
            options: {
              maxWidth: 1380,
              linkImagesToOriginal: false
            }
          },
          { resolve: "gatsby-remark-responsive-iframe" },
          { resolve: "gatsby-remark-copy-linked-files" },
          { resolve: "gatsby-remark-numbered-footnotes" },
          { resolve: "gatsby-remark-smartypants" },
          { resolve: "gatsby-remark-code-titles" },
          { resolve: "gatsby-remark-prismjs" }
        ]
      }
    },
    {
      resolve: `gatsby-plugin-google-analytics`,
      options: {
        // trackingId: `ADD YOUR TRACKING ID HERE`,
      }
    },
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `Gatsby Starter Blog`,
        short_name: `GatsbyJS`,
        start_url: `/`,
        background_color: `#ffffff`,
        theme_color: `#663399`,
        display: `minimal-ui`,
        icon: require.resolve(`./content/assets/gatsby-icon.png`)
      }
    },
    `gatsby-plugin-offline`,
    `gatsby-plugin-react-helmet`,
    {
      resolve: `gatsby-plugin-typography`,
      options: {
        pathToConfigModule: require.resolve(`./src/utils/typography`)
      }
    },
    `gatsby-plugin-twitter`,
    `gatsby-plugin-netlify`,
    {
      resolve: "gatsby-plugin-page-creator",
      options: {
        path: `${__dirname}/src/pages`
      }
    },
    {
      resolve: "gatsby-plugin-use-dark-mode",
      options: {
        classNameDark: "dark",
        classNameLight: "light",
        storageKey: "theme"
      }
    }
  ]
};

module.exports = {
  plugins: [
    `gatsby-plugin-stable`,

    `gatsby-plugin-independent-node`,

    `gatsby-source-parent-change-for-transformer`,
    `gatsby-transformer-parent-change`,

    `gatsby-source-child-change-for-transformer`,
    `gatsby-transformer-child-change`,

    `gatsby-source-parent-change-for-fields`,
    `gatsby-fields-parent-change`,

    `gatsby-source-child-change-for-fields`,
    `gatsby-fields-child-change`,
  ],
}

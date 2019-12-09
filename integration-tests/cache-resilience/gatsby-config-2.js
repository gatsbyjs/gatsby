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

    `gatsby-cache-stable`,
    `gatsby-cache-unstable`,

    `gatsby-plugin-addition`,
    // `gatsby-plugin-deletion`,

    `gatsby-source-parent-addition-for-transformer`,
    `gatsby-transformer-parent-addition`,

    `gatsby-source-child-addition-for-transformer`,
    `gatsby-transformer-child-addition`,

    `gatsby-source-parent-addition-for-fields`,
    `gatsby-fields-parent-addition`,

    `gatsby-source-child-addition-for-fields`,
    `gatsby-fields-child-addition`,

    // `gatsby-source-parent-deletion-for-transformer`,
    `gatsby-transformer-parent-deletion`,

    `gatsby-source-child-deletion-for-transformer`,
    // `gatsby-transformer-child-deletion`,

    `gatsby-source-child-deletion-for-fields`,
    // `gatsby-fields-child-deletion`,
  ],
}

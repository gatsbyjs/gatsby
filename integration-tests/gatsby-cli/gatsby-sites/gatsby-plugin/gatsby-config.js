module.exports = {
    plugins: [
        {
            resolve: "gatsby-source-filesystem",
            options: {
                "name": "pages",
                "path": "./src/pages/"
            }

        },
        `gatsby-plugin-offline`,
        // ignore comments
    ]
}
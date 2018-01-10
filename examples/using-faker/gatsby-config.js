module.exports = {
  siteMetadata: {
    title: `Gatsby Default Starter`,
  },
  plugins: [
    `gatsby-plugin-react-helmet`,
    {
      resolve: `gatsby-source-faker`,
      options: {
        schema: {
          name: [`firstName`, `lastName`],
          address: [`streetAddress`, `streetName`, `city`, `state`, `zipCode`],
          internet: [`email`],
          lorem: [`paragraph`],
          phone: [`phoneNumber`],
        },
        count: 1,
        type: `PersonalData`,
      },
    },
    {
      resolve: `gatsby-source-faker`,
      options: {
        schema: {
          company: [`companyName`, `companySuffix`],
        },
        count: 3,
        type: `CompanyData`,
      },
    },
  ],
}

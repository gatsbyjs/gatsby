import packageJson from "gatsby-adapter-netlify/package.json"

export const generator = `gatsby-adapter-netlify@${
  packageJson?.version ?? `unknown`
}`

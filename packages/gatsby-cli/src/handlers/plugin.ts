import { listPlugins } from "gatsby-core-utils"
import reporter from "../reporter"

export default async (root: string, cmd: string | undefined): Promise<void> => {
  switch (cmd) {
    case `docs`:
      console.log(`
Using a plugin:
- What is a Plugin? (https://www.gatsbyjs.com/docs/what-is-a-plugin/)
- Using a Plugin in Your Site (https://www.gatsbyjs.com/docs/how-to/plugins-and-themes/using-a-plugin-in-your-site/)
- Loading Plugins from Your Local Plugins Folder (https://www.gatsbyjs.com/docs/loading-plugins-from-your-local-plugins-folder/)
- Plugin Library (https://www.gatsbyjs.com/plugins/)

Creating a plugin:
- Naming a Plugin (https://www.gatsbyjs.com/docs/how-to/plugins-and-themes/naming-a-plugin/)
- Files Gatsby Looks for in a Plugin (https://www.gatsbyjs.com/docs/files-gatsby-looks-for-in-a-plugin/)
- Creating a Generic Plugin (https://www.gatsbyjs.com/docs/how-to/plugins-and-themes/creating-a-generic-plugin/)
- Creating a Local Plugin (https://www.gatsbyjs.com/docs/creating-a-local-plugin/)
- Creating a Source Plugin (https://www.gatsbyjs.com/docs/how-to/plugins-and-themes/creating-a-source-plugin/)
- Creating a Transformer Plugin (https://www.gatsbyjs.com/docs/how-to/plugins-and-themes/creating-a-transformer-plugin/)
- Submit to Plugin Library (https://www.gatsbyjs.com/contributing/submit-to-plugin-library/)
- Maintaining a Plugin (https://www.gatsbyjs.com/docs/how-to/plugins-and-themes/maintaining-a-plugin/)
- Join Discord #plugin-authoring channel to ask questions! (https://gatsby.dev/discord/)
`)
      return
    case `ls`: {
      try {
        const plugins = await listPlugins({ root })
        let list = ``
        plugins.forEach(plugin => (list += `- ${plugin}\n`))
        console.log(`
Following plugins are installed:

${list}
        `)
      } catch {
        reporter.error(
          `There was a problem parsing your \`gatsby-config.js\` file.\nIt may be malformed. Or, the syntax you're using is not currently supported by this command.`
        )
      }

      return
    }
    default:
      reporter.error(`Unknown command ${cmd}`)
  }
  return
}

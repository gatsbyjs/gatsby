const path= require(`path`);

const {createFilePath}= require(`gatsby-source-filesystem`);

exports.createPages = ({graphql,actions}) => {
    const {createPage}= actions
    const searchTemplate=path.resolve(`./src/templates/blog-search.js`)
    const blogPost= path.resolve(`./src/templates/post.js`)
    return graphql(
        `
        {
            allMarkdownRemark{
              edges {
                node {
                  id
                  html
                  fields {
                    slug
                  }
                  frontmatter {
                    title
                    author
                  }
                }
              }
            }
          }
        `
    ).then(result=>{
        if (result.errors) {
            throw result.errors
        }
        const posts = result.data.allMarkdownRemark.edges
        
        createPage({
          path:`/`,
          component:searchTemplate,
          context:{
            blogPosts: result.data.allMarkdownRemark.edges.map(item=>{
              return {
                id:item.node.id,
                title:item.node.frontmatter.title,
                author:item.node.frontmatter.author,
                path:item.node.fields.slug
              }
            }),
            options:[`title`,`author`]
          }
        })
        posts.forEach(element => {
            createPage({
                path:element.node.fields.slug, // creates the page for the blog entry post
                component:blogPost,
                context:{
                    content: element.node.html,
                    title:element.node.frontmatter.title,
                    author:element.node.frontmatter.author
                }
            })
        });
    }) 
}


exports.onCreateNode = ({ node, actions, getNode }) => {
    const { createNodeField } = actions
  
    if (node.internal.type === `MarkdownRemark`) {
      const value = createFilePath({ node, getNode })
      createNodeField({
        name: `slug`,
        node,
        value,
      })
    }
  }
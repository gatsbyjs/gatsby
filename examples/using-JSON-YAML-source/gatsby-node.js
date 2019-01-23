/**
 * Implement Gatsby's Node APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/node-apis/
 */

// You can delete this file if you're not using it
const fs  = require('fs');
const yaml = require('js-yaml')
exports.createPages=({actions})=>{
    const {createPage}= actions
    return new Promise((resolve)=>{
        /* const JSONDoc= require('./content/data/json/index.json')
        JSONDoc.forEach(element => {
            createPage({
                path:element.path,
                component:require.resolve('./src/templates/basicTemplate.js'),
                context:{
                    pageContent:element.content,
                    links:element.links
                }
            })
        }); */

        //yaml
        const ymlDoc= yaml.safeLoad(fs.readFileSync('./content/data/yaml/index.yaml','utf-8'))
        //
        ymlDoc.forEach(element=>{
            createPage({
                path:element.path,
                component:require.resolve('./src/templates/basicTemplate.js'),
                context:{
                    pageContent:element.content,
                    links:element.links
                }
            })
        })
        resolve()
    })
}
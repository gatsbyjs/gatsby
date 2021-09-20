#!/usr/bin/env node

const path = require("path")
const fs = require("fs-extra")
const pluginPath= process.argv[2]
const Joi  = require("gatsby-plugin-utils")
async function run() {
    if(!pluginPath) {
        console.error("Please pass a path to the plugin directory")
        return
    }
    

    const rootDir = path.resolve(pluginPath)
    if(!fs.existsSync(rootDir)) {
        console.error(`The plugin directory ${rootDir} does not exist`)
        return
    }

    const stat = await fs.stat(rootDir)

    if(!stat.isDirectory()) {
        console.error(`The plugin path ${rootDir} is not a directory`)
        return
    }

    let pluginName

    try {
        const { name } = require(path.resolve(rootDir, "package.json"))
        if(!name) {
            console.error("Plugin package.json does not have a name field")
            return
        }
        pluginName = name

    } catch (e) {
        console.error("Could not open package.json. Are you sure the plugin directory is correct?")
        return
    }

    const gatsbyNodePath = path.resolve(rootDir, "gatsby-node.js")

    if(!fs.existsSync(gatsbyNodePath)) {
        console.error(`Could not find gatsby-node.js in ${gatsbyNodePath}. Are you sure this is a plugin directory?`)
        return
    }

    let pluginOptionsSchema

    try {
        const gatsbyNode = require(gatsbyNodePath)
        pluginOptionsSchema = gatsbyNode.pluginOptionsSchema
    } catch(e) {
        console.error(`Could not load gatsby-node.js. You may need to build the plugin first.`)
        console.log("Error was:", e.message)
        return
    }

    if(!pluginOptionsSchema) {
        console.error("The plugin does not include a pluginOptionsSchema")
        return 
    }

    let optionsSchema 

    try {
        const schema = pluginOptionsSchema({ Joi })
        optionsSchema = schema.describe()
    } catch (e) {
        console.error("Failed to generate schema")
        console.error(e.message)
        return
    }

    const schemataPath = path.resolve(__dirname, "..", "src", "plugin-schemas.json")

    if(!fs.existsSync(schemataPath)) {
        console.error("Could not find output file")
        return 
    }

    const json = await fs.readJSON(schemataPath) 

    json[pluginName] = optionsSchema

    console.log(`Writing "${pluginName} to schemataPath`)
    await fs.writeJSON(schemataPath, json)


}

run() 

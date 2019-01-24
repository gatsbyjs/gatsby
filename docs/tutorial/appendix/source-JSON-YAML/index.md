---
title: "Sourcing from JSON or YAML"
---

# Beforehand

As you're presented with Gatsby, you'll see that you have at your disposal a myriad of ways to pull data from into your website, ranging from the most used ones like [Contenfull](https://www.contentful.com/), or [WordPress](https://wordpress.com/), [Drupal](https://www.drupal.org/), to the most edgier ones like [ButterCMS](https://buttercms.com/), [GraphCMS](https://graphcms.com/) and their appropriate plugins to ensure connectivity.

With this tutorial, it will help you return to the origins and instead of pulling data in from the providers above, you'll use a plain JSON file and YAML to achieve this.

It will presented a way to use either JSON or YAML files, for creating the bare structure of a gatsby website, by adding some pages dynamically with either one of the above.

Also a way to load contents from both sources to a page.

## Prerequisites

Before we go through the steps needed to add plain JSON or YAML into your Gatsby website, it would be advised
if the reader is not familiar on how Gatsby works and is set up to follow through the [tutorial](https://www.gatsbyjs.org/tutorial/) and brush up on the [documentation](https://www.gatsbyjs.org/docs/).

Otherwise just skip this part and move onto the next part.

## Setup

Open up a terminal and create a new folder that will be used for the project:

```bash
mkdir mywebsite
```

Inside that folder, create a new Gatsby website using a starter template, using the command bellow.

```bash
npx gatsby new gatsby-with-JSON-YAML https://github.com/gatsbyjs/gatsby-starter-default
```

After the process is complete, some additional packages are needed.

Navigate into the `gatsby-with-JSON-YAML` folder and issue the following command:

```bash
npm install --save js-yaml uuid axios
```

Or if Yarn is being used:

```bash
yarn add js-yaml uuid axios
```

[Axios](https://github.com/axios/axios) will be used to handle all promise based requests, as it can be seen later. [js-yaml](https://github.com/nodeca/js-yaml) for parsing the yaml file contents. [uuid](https://github.com/kelektiv/node-uuid#readme) is used as a safety measure for React element key handling.

Create a folder called `data` in the root of project folder and two more, one with the name `json` and another one called `yaml` inside that.

Also another folder called `static`, as per documented [here](https://www.gatsbyjs.org/docs/static-folder/), so that the file contents can be handled more easily as you can read about later.

We can now move onto the actual implementation of the code.

### Using JSON as a source for building a site

In this section it will be presented a way to create the bare structure of a site using a JSON file and Gatsby API.

Start by copying the contents of the example JSON provided [here](https://github.com/gatsbyjs/gatsby/tree/master/examples/sourcing-from-JSON-or-Yaml/content/data/json/) into the `json` folder created above.

Change the `gatsby-node.js` file to the following:

```javascript
exports.createPages = ({ actions }) => {
  const { createPage } = actions
  return new Promise(resolve => {
    const JSONDoc = require("./content/data/json/index.json")
    JSONDoc.forEach(element => {
      createPage({
        path: element.path,
        component: require.resolve("./src/templates/basicTemplate.js"),
        context: {
          pageContent: element.content,
          links: element.links,
        },
      })
    })
    resolve()
  })
}
```

What the above code is doing:

- Loading the contents of the JSON file into a `const`.
- Iterating over the contents, to create a page based on a template.
- Inside every page created the [pageContext](https://www.gatsbyjs.org/docs/behind-the-scenes-terminology/#pagecontext) is used to inject some data that will be presented in the page and also some navigation between the pages.

Once that is done, create the file `./src/templates/basicTemplate.js` with the following contents:

```javascript
import React from "react"
import uuid from "uuid"
import Layout from "../components/layout"
import SEO from "../components/seo"
import { Link } from "gatsby"
const basicTemplate = props => {
  const { pageContext } = props
  const { pageContent, links } = pageContext

  return (
    <Layout>
      <SEO
        title={`page created using basic json`}
        keywords={[`gatsby`, `application`, `react`]}
      />
      <div>
        {pageContent.map(data => (
          <div key={uuid.v4()}>{data.item}</div>
        ))}
      </div>
      <div>
        {links.map(item => (
          <div key={`linked_${uuid.v4()}`}>
            <Link to={item.to}>{item.to}</Link>
          </div>
        ))}
      </div>
    </Layout>
  )
}
export default basicTemplate
```

The above code is a plain React presentational component that recieves some data via the `pageContext` prop and shows it.

Once all is done, issuing `gatsby develop` and opening your favourite browser of choice and navigating into:
`http://localhost:8000/page1` for instance will what was done here.

Now onto using a YAML file.

### Using YAML as a source for building a site

In order the same approach as the one documented above, but this time with a YAML file, is similar, in this particular case copy the YAML file located [here](https://github.com/gatsbyjs/gatsby/tree/master/examples/sourcing-from-JSON-or-Yaml/content/data/yaml/) to the `yaml` folder created earlier.

Now change the `gatsby-node.js` to the following:

```javascript
const fs = require("fs")
const yaml = require("js-yaml") // the yaml parser being imported to be used.
exports.createPages = ({ actions }) => {
  const { createPage } = actions
  return new Promise(resolve => {
    //yaml file loaded here
    const ymlDoc = yaml.safeLoad(
      fs.readFileSync("./content/data/yaml/index.yaml", "utf-8")
    )
    //
    ymlDoc.forEach(element => {
      createPage({
        path: element.path,
        component: require.resolve("./src/templates/basicTemplate.js"),
        context: {
          pageContent: element.content,
          links: element.links,
        },
      })
    })
    resolve()
  })
}
```

The code above is somewhat similar to the code described above.

The only diference here is the way how the data is loaded, here is where the `js-yaml` package installed earlier comes into play. It will load the contents of the file and create the website structure and some contents.

### Using JSON as a content provider a page

Now we'll go back to JSON, to be used as a source for content to a particular gatsby page.

Now you'll see the reason of the `static` folder.
Copy this [file](https://github.com/gatsbyjs/gatsby/tree/master/examples/sourcing-from-JSON-or-Yaml/static/second.json) inside the newly created folder.

Create a new file inside the `pages` folder, for this example with will be named `jsononclient.js`, but whatever name you decide is fine.

Inside that file add the following:

```javascript
import React, { Component } from "react"
import axios from "axios"
import Layout from "../components/layout"
import SEO from "../components/seo"

class ClientJSON extends Component {
  state = {
    jsonData: {},
  }
  async componentDidMount() {
    const JSONRequest = await axios.get("./second.json")
    this.setState({ jsonData: JSONRequest.data })
  }
  render() {
    const { jsonData } = this.state
    if (!jsonData.title) {
      return <h1>fetching data! give it a moment</h1>
    }
    return (
      <Layout>
        <SEO title={jsonData.title} />
        <div>
          {jsonData.content.map(data => {
            return <div>{data.item}</div>
          })}
        </div>
      </Layout>
    )
  }
}

export default ClientJSON
```

What the above code is doing is perfoming a GET request, using [Axios](https://github.com/axios/axios), the url when resolved, will load the contents of that particular static asset and update the component state in order to be used.

**Be advised** that this block of code and the one bellow will function while developing your site. Some changes are required before issuing a production build.

### Using YAML as a content provider a page

Finally the same approach can be used for a YAML file, the process is somewhat similar to the above, instead of the file being copied to the static folder being the .json one, now is the .yaml one.

Create file inside the `pages` folder, for this example it will be named `ymlonclient.js`, but like above, the name is entirely to the reader.

Inside the newly create file, add the following contents:

```javascript
import React, { Component } from "react"
import Layout from "../components/layout"
import SEO from "../components/seo"
import axios from "axios"
import yaml from "js-yaml"
class ClientYAML extends Component {
  state = {
    yamlData: {},
  }
  async componentDidMount() {
    const ymlfile = await axios.get("./second.yaml")
    const data = yaml.safeLoad(ymlfile.data)
    this.setState({ yamlData: data })
  }
  render() {
    const { yamlData } = this.state
    if (!yamlData.title) {
      return <h1>fetching data! give it a moment</h1>
    }
    return (
      <Layout>
        <SEO title={yamlData.title} />
        <div>
          {yamlData.content.map(data => {
            return <div>{data.item}</div>
          })}
        </div>
      </Layout>
    )
  }
}
export default ClientYAML
```

What the following code will do, is in fact similar to the one used for example mentioned above. The only diference is the way we handle the loading of the contents originating from the file.
Once again taking advantage of the `js-yaml` package added earlier so that loading either contents can be achieved on the client side.

## Last words

Gatsby offers a way achieve almost the same result, by using the appropriate plugins and graphql.
But that's the matter for another tutorial.

With this document, it was presented in a rather extensive way, how to use these simple structures to handle data, to be used with Gatsby site.

Now go make something great.

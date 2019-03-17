---
title: "YAML as a source for building a site"
---

# Table of Contents

- [Introduction](#Beforehand)
- [Setup](#Setup)
- [Adding Content](#Adding-some-content)
- [Gatsby Config](#Gatsby-configuration)
- [Gatsby Template](#Gatsby-Template)
- [Joining the pieces](#Joining-the-pieces)
- [Sourcing from JSON](https://www.gatsbyjs.org/docs/using-gatsby-without-graphql/)

# Beforehand

As you're presented with Gatsby, you'll see that you have at your disposal a myriad of ways to pull data into your website, ranging from the most used ones like [Contentful](https://www.contentful.com/), or [WordPress](https://wordpress.com/), [Drupal](https://www.drupal.org/), to the most edgier ones like [ButterCMS](https://buttercms.com/) or [GraphCMS](https://graphcms.com/).

Each one using the correspondent plugin.

This tutorial will help you return to the origins.

Instead of pulling data using any of the available plugins for each provider mentioned, you'll create a simple fully functional Gatsby website that is sourced from a YAML file.

## Prerequisites

Before we go through the details and code, you should be familiar with the basics of Gatsby.

Check out the [tutorial](https://www.gatsbyjs.org/tutorial/) and brush up on the [documentation](https://www.gatsbyjs.org/docs/).
In addition to this, some knowledge of [ES6 syntax](https://medium.freecodecamp.org/write-less-do-more-with-javascript-es6-5fd4a8e50ee2) will be useful.

Otherwise just skip this part and move onto the next part.

## Setup

You'll start by creating a new Gatsby website based on the official _hello world starter_.

Open up a terminal and run the following command.

```bash
gatsby new gatsby-sourcing-YAML https://github.com/gatsbyjs/gatsby-starter-hello-world
```

After the process is complete, some additional packages are needed.

Change directories to the newly created Gatsby website and issue the following command:

```bash
npm install --save js-yaml uuid
```

Or if Yarn is being used:

```bash
yarn add js-yaml uuid
```

The newly added packages are responsible for:

- Parsing the yaml file safely.
- Ensure uniqueness with React prop keys.

## Adding some content

Once the installation is finished, it's time to add some contents.

Start by creating a folder called `content` and add a file called `index.yaml` inside with the following contents:

```yaml
- path: "/page1"
  content:
    - item: one item
    - item: two items
    - item: three items
  links:
    - to: "/page2"
    - to: "/page5"
- path: "/page2"
  content:
    - item:
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
        quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
        Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore
        eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt
        in culpa qui officia deserunt mollit anim id est laborum.
  links:
    - to: "/page1"
- path: "/page3"
  content:
    - item: Cupcake ipsum dolor sit amet tootsie roll sesame snaps chupa chups.
        Sugar plum chupa chups topping I love carrot cake I love marshmallow dessert.
        Toffee gingerbread pie apple pie jelly beans pastry cookie.
        Lemon drops wafer I love pastry halvah dragée pudding cake.
        Cake halvah cookie jelly beans topping pudding cheesecake donut.
        Cake croissant marshmallow.
        Sesame snaps apple pie I love I love cake danish powder.
        Lollipop sweet caramels.
        Tiramisu danish marshmallow candy canes.
        Powder cupcake cotton candy bonbon chocolate bar marshmallow gummies cheesecake marzipan.
        Gummies soufflé candy. Candy canes muffin chocolate brownie pudding.
  links: []
- path: "/page4"
  content:
    - item:
        Lorem ipsum dolor amet mustache knausgaard +1, blue bottle waistcoat tbh
        semiotics artisan synth stumptown gastropub cornhole celiac swag. Brunch raclette
        vexillologist post-ironic glossier ennui XOXO mlkshk godard pour-over blog tumblr
        humblebrag. Blue bottle put a bird on it twee prism biodiesel brooklyn. Blue
        bottle ennui tbh succulents.
  links:
    - to: "/page5"
    - to: "/page1"
- path: "/page5"
  content:
    - item: St. agur blue cheese queso cheesecake.
        Cheesecake the big cheese monterey jack cheesecake monterey jack paneer halloumi rubber cheese.
        Cheese triangles cheese strings cheese slices cheesy feet taleggio cottage cheese when the cheese comes out everybody's happy gouda.
        Feta cauliflower cheese babybel cheese on toast monterey jack.
    - item:
        Bacon ipsum dolor amet short ribs brisket venison rump drumstick pig sausage
        prosciutto chicken spare ribs salami picanha doner. Kevin capicola sausage,
        buffalo bresaola venison turkey shoulder picanha ham pork tri-tip meatball meatloaf
        ribeye. Doner spare ribs andouille bacon sausage. Ground round jerky brisket
        pastrami shank.
  links:
    - to: "/page1"
```

What the code block above is doing, is nothing more, nothing less, than creating a simple YAML object in which:

- Each `path` is a page's endpoint.
- The `contents` list holds some data to be displayed.
- The `links` list holds some endpoints to other pages.

## Gatsby configuration

Now that we have almost all the parts necessary in place, you'll need to make a small adjustment to your Gatsby website.

Start by creating a `gatsby-node.js` with the following contents:

```javascript
const fs = require("fs")
const yaml = require("js-yaml") // the yaml parser to be used being imported .
exports.createPages = ({ actions }) => {
  const { createPage } = actions
  return new Promise(resolve => {
    //yaml file loaded here
    const ymlDoc = yaml.safeLoad(
      fs.readFileSync("./content/index.yaml", "utf-8")
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

Breaking down the code into smaller parts:

1. The `js-yaml` package installed earlier is imported.
2. The `index.yaml` file is loaded and the content parsed.
3. Through the use of Gatsby's `createPage()` api, the parsed file will be used to create some pages programmatically.
4. Using the `pageContext` property, some additional data will be provided to each page.

## Review of the steps so far

Doing a quick review of what you have done so far:

1. Created a new Gatsby website based on a template.
2. Added some dependencies to handle YAML files.
3. Created the file and folder structure to house the contents.
4. Configured Gatsby to fetch the data and create some pages programmatically.

## Gatsby Template

The only missing thing is the template used for each page created.

Create a file called `basicTemplate.js` in the `src/templates/` folder and add the following contents:

```javascript
import React from "react"
import uuid from "uuid"
import { Link } from "gatsby"
const basicTemplate = props => {
  const { pageContext } = props
  const { pageContent, links } = pageContext

  return (
    <div style={{ maxWidth: `960px`, margin: `1.45rem` }}>
      <div>
        {pageContent.map(data => {
          return <div key={uuid.v4()}>{data.item}</div>
        })}
      </div>
      <div>
        {links.map(item => {
          return (
            <div>
              <Link to={item.to}>{item.to}</Link>
            </div>
          )
        })}
      </div>
    </div>
  )
}
export default basicTemplate
```

## Joining the pieces

After all these steps are complete, you should have the following file and folder structure:

```
  |gatsby-sourcing-YAML
    |content
      - index.yaml
    |src
      |pages
        - index.js
        - 404.js
      |templates
        - basicTemplate.js
    - gatsby-node.js
```

Issuing `gatsby develop` in the terminal and opening a browser window for instance, to `http://localhost:8000/page1`, you'll see a page with some content,sourced from YAML.

To get it to work on your site, you would only need to copy over the `gatsby-node.js` file located [here](https://github.com/gatsbyjs/gatsby/examples/using-gatsby-with-json-yaml/gatsby-node.js). The template located [here](https://github.com/gatsbyjs/gatsby/examples/using-gatsby-with-json-yaml/src/templates/basicTemplate.js). And the yaml file located [here](https://github.com/gatsbyjs/gatsby/examples/using-gatsby-with-json-yaml/content/templates/index.yaml).

---

## title: " Client-side sourcing with JSON or YAML"

# Table of Contents

- [Introduction](#Beforehand)
- [Setup](#Setup)
- [YAML example](#YAML-example)
- [JSON example](#JSON-example)
- [Joining the pieces](#Joining-the-pieces)

# Beforehand

As you come across Gatsby and start discovering the extent of it's possibilities, sometimes you might wonder about the basic things.

Things like importing a JSON file or a YAML file directly into a page.

And that's what you'll build while following this small tutorial.

## Prerequisites

Before we go through the details and code, you should be familiar with the basics of Gatsby.

Check out the [tutorial](https://www.gatsbyjs.org/tutorial/) and brush up on the [documentation](https://www.gatsbyjs.org/docs/).
In addition to this, some knowledge of [ES6 syntax](https://medium.freecodecamp.org/write-less-do-more-with-javascript-es6-5fd4a8e50ee2) will be useful.

Otherwise just skip this part and move onto the next part.

## Setup

You'll start by creating a new Gatsby website based on the official _hello world starter_.

Open up a terminal and run the following command.

```bash
gatsby new gatsby-client-sourcing-YAML-JSON https://github.com/gatsbyjs/gatsby-starter-hello-world
```

After the process is complete, some additional packages are needed.

Change directories to the newly created Gatsby website and issue the following command:

```bash
npm install --save uuid
```

Or if Yarn is being used:

```bash
yarn add uuid
```

This package is used to ensure uniqueness with React prop keys.

## YAML example

Starting from YAML, if you want to see how to do it using JSON, jump to the [next section](#JSON-example).

### Adding the YAML content

Create a folder called `content` and inside, add a file called `client-data.yml` with the following content inside:

```yml
title: YAML used in the client with React and Gatsby
content:
  - item:
      Cupcake ipsum dolor. Sit amet marshmallow topping cheesecake muffin. Halvah
      croissant candy canes bonbon candy. Apple pie jelly beans topping carrot cake
      danish tart cake cheesecake. Muffin danish chocolate soufflé pastry icing bonbon
      oat cake. Powder cake jujubes oat cake. Lemon drops tootsie roll marshmallow halvah
      carrot cake.
  - item:
      Just say anything, George, say what ever's natural, the first thing that comes
      to your mind. Take that you mutated son-of-a-bitch. My pine, why you. You space
      bastard, you killed a pine. You do? Yeah, it's 8:00. Hey, McFly, I thought I told
      you never to come in here. Well it's gonna cost you. How much money you got on
      you?
  - item: 192.33
  - item: 111111
```

### Creating the page

Now that you have something you want to show, the only thing missing is to create a page that will consume the data.

Add a new file called `ymlonclient.js` inside the `pages` folder, with the following code:

```javascript
import React from "react"
import uuid from "uuid"
import YAMLData from "../../content/client-data.yaml"

const ClientYAML = () => (
  <div style={{ maxWidth: `960px`, margin: `1.45rem` }}>
    <h1>{YAMLData.title}</h1>
    <div>
      {YAMLData.content.map(data => {
        return <div key={`content_item_${uuid.v4()}`}>{data.item}</div>
      })}
    </div>
  </div>
)
export default ClientYAML
```

As you can see, the code above is nothing more, nothing less than a functional stateless React component, that when rendered by Gatsby, and without any extra configuration will display a page sourced from a YAML file.

## JSON example

In this part you'll use JSON as a datasource.

### Adding the JSON content

Create a folder named `content` if it doesn't exist, and then add a new file inside called `client-data.json` with the following content inside:

```json
{
  "title": "JSON used in the client with React and Gatsby",
  "content": [
    {
      "item": "Cupcake ipsum dolor. Sit amet marshmallow topping cheesecake muffin. Halvah croissant candy canes bonbon candy. Apple pie jelly beans topping carrot cake danish tart cake cheesecake. Muffin danish chocolate soufflé pastry icing bonbon oat cake. Powder cake jujubes oat cake. Lemon drops tootsie roll marshmallow halvah carrot cake."
    },
    {
      "item": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
    },
    {
      "item": 192.33
    },
    {
      "item": 111111
    }
  ]
}
```

### Creating the page

Now that you have something that needs to be shown, all that's missing is a page to show it.

Add a new file called `jsononclient.js` inside the `pages` folder with the following code:

```javascript
import React from "react"
import uuid from "uuid"
import JSONData from "../../content/client-data.json"
const ClientJSON = () => (
  <div style={{ maxWidth: `960px`, margin: `1.45rem` }}>
    <h1>{JSONData.title}</h1>
    <div>
      {JSONData.content.map(data => {
        return <div key={`content_item_${uuid.v4()}`}>{data.item}</div>
      })}
    </div>
  </div>
)
export default ClientJSON
```

The only thing different in this case, is the file import. Instead of the YAML file, this time you're importing directly a JSON file into the page component.

Once again out of the box and without any extra configuration the page will show the content.

## Joining the pieces

After all these steps are complete, you should have the following file and folder structure:

```
  |gatsby-client-sourcing-YAML-JSON
    |content
      - client-data.yaml / - client-data.json
    |src
      |pages
        - index.js
        - 404.js
        - jsononclient.js
        - ymlonclient.js
```

Issuing `gatsby develop` in the terminal and opening a browser window to `http://localhost:8000/jsononclient` or `http://localhost:8000/ymlonclient`, you'll see the results of this small tutorial.

To get it to work on your site, you would only need to copy over the page file `jsononclient.js` located [here](https://github.com/gatsbyjs/gatsby/examples/using-gatsby-with-json-yaml/jsononclient.js) for JSON.

Or the `ymlonclient.js` page file located [here](https://github.com/gatsbyjs/gatsby/examples/using-gatsby-with-json-yaml/src/pages/ymlonclient.js) for YAML.

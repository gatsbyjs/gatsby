---
title: Debugging Gatsby
---

Gatsby is Node.js application and you can debug it using standard tools for Node.js applications.  

In this guide You will learn how to use
 - [Chrome DevTools for Node](#chrome-devtools-for-node)
 - [VSCode debugger](#vscode-debugger)

As example we will use code snippet below in `gatsby-node.js`:
```js
const { createFilePath } = require('gatsby-source-filesystem')

exports.onCreateNode = args => {
  const { actions, Node } = args

  if (Node.internal.type === 'MarkdownRemark') {
    const { createNodeField } = actions

    const value = createFilePath({ node, getNode })
    createNodeField({
      name: `slug`,
      node,
      value,
    })
  }
}
```

There is a bug in this code and using it will produce error below:

```
TypeError: Cannot read property 'internal' of undefined

  - gatsby-node.js:6 Object.exports.onCreateNode.args [as onCreateNode]
    D:/dev/blog-v2/gatsby-node.js:6:12
```

## Chrome DevTools for Node

### Running Gatsby with `inspect` flag

In your project directory instead of running `gatsby develop` run below command:

```shell
node --inspect-brk --no-lazy node_modules/gatsby/dist/bin/gatsby develop
```

 - `--inspect-brk` will enable inspector agent which will allow You to connect debugger. It will also pause execution until we connect debugger and resume it.
 - `--no-lazy` - this will force node's V8 to disable lazy compilation and will help with using breakpoints

### Connecting DevTools

Open `chrome://inspect` in Chrome browser and connect to Remote Target by clicking `inspect` link:

![Chrome inspect page](./images/chrome-devtools-inspect.png)

You should see this Chrome DevTools started and that code execution is paused in `gatsby.js` entry file:

![Paused Chrome DevTools](./images/chrome-devtools-init.png)

### Setting up `Sources`

Right now You can't see files in Sources yet. You need to add those using `Add folder to workspace` button and pick directory with code You want to debug. If you want to debug code in Your `gatsby-node.js` or your local plugins, pick Your project directory. If you want debug `gatsby` package You will have to pick `gatsby` directory inside `node_modules`.

Example we are using has problematic code in local `gatsby-node.js` file, so let's add directory containing it to sources. You should have directory with your code in left pane:

![Files added to Sources tab](./images/chrome-devtools-files.png)

### Using DevTools

Let's go ahead and add breakpoint just before place that error is thrown. To add breakpoint navigate to `gatsby-node.js` and left click on line number:

![Added breakpoint](./images/chrome-devtools-new-breakpoint.png)

Now you can resume code execution by clicking resume icon in DevTools debug toolbar or by pressing F8. Gatsby will start running and pause once it reaches breakpoint allowing you to inspect variables:

![Breakpoint hit](./images/chrome-devtools-breakpoint-hit.png)

To inspect variables you can hover mouse over them or go to `Scope` section in right pane (either collapse `Call Stack` section or scroll through it to the bottom).

In our example `Node` is `undefined` and to figure out why let's go backward. `Node` is extracted from `args` so let's examine that by hovering `args`:

![Examine variable](./images/chrome-devtools-examine-var.png)

We can now see the problem - `args` doesn't contain `Node` - it contains `node`. So this small typographic mistake was causing our code to fail. Adjusting our code to use lowercase `node` fixes the problem and we did that without adding tons of `console.log` output!

### Finishing thoughts

We can succussfully debug our code using Chrome DevTools but using it isn't really that convenient. There's just a lot of steps we need to do manually everytime we want to use debugger so in next section You will learn how to use built-in debugger capabilities of VSCode. 

## VSCode debugger

Using builtin debuggers in code editors is very convenient. You will be able to skip a lot of setup needed to use Chrome DevTools. You also will be able to put breakpoints in same view you write your code.

We won't go in depth here about how to debug in VSCode - for that You can check [excellent documentation](https://code.visualstudio.com/docs/editor/debugging) on VSCode page. We will however share launch configuration needed to run and debug Gatsby:

`launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Gatsby develop",
      "type": "node",
      "request": "launch",
      "protocol": "inspector",
      "program": "${workspaceRoot}/node_modules/gatsby/dist/bin/gatsby",
      "args": ["develop"],
      "stopOnEntry": false,
      "runtimeArgs": ["--nolazy"]
    },
    {
      "name": "Gatsby build",
      "type": "node",
      "request": "launch",
      "protocol": "inspector",
      "program": "${workspaceRoot}/node_modules/gatsby/dist/bin/gatsby",
      "args": ["build"],
      "stopOnEntry": false,
      "runtimeArgs": ["--nolazy"]
    }
  ]
}
```

After putting breakpoint in `gatsby-node.js` and using `Start debugging` command from vscode we see final result:

![VSCode breakpoint hit](./images/vscode-debug.png)
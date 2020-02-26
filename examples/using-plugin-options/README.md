# Adding Options to Plugins

This is an example repository demonstrating how to add options to a plugin you've authored.

## Running the example

In this directory, be sure to install dependencies for Gatsby:

```sh
npm install
```

Then run `gatsby develop`:

```sh
gatsby develop
```

In your command line output, you should then see the text listed below. This text is showing how the code for each plugin is run sequentially thanks to the Node API implemented.

```sh
$ gatsby develop
success open and validate gatsby-configs - 0.034s
success load plugins - 0.050s
logging: "Hello world" to the console
logging: "default message" to the console
success onPreInit - 0.022s
```

## Understanding what is happening

If you refer to the `gatsby-config` in this example site, you'll see two plugins included in the plugins array. The first is a local plugin called `gatsby-plugin-console-log`, which logs a message to the console when you run `gatsby develop`. It has options passed in and will display the custom message.

The second plugin in the plugins array uses the same plugin from the plugins folder (you can read about [adding local plugins in the Gatsby docs](https://www.gatsbyjs.org/docs/loading-plugins-from-your-local-plugins-folder/)), it will log a default message because no options are passed in.

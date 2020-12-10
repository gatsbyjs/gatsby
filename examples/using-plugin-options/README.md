# Adding Options to Plugins

This is an example repository demonstrating how to add options to a plugin you've authored.

## Running the example

In this directory, be sure to install dependencies for Gatsby:
ell

```shell
npm install
```

Then run `gatsby develop`:

```shell
gatsby develop
```

In your command line output, you should then see the text listed below. This text is showing how the code for each plugin is run sequentially thanks to the Node API implemented.

```shell
$ gatsby develop
success open and validate gatsby-configs - 0.034s
success load plugins - 0.050s
logging: "Hello world" to the console
logging: "default message" to the console
success onPreInit - 0.022s
```

## Understanding what is happening

If you refer to the `gatsby-config` in this example site, you'll see two plugins included in the plugins array. In actuality, it is the same plugin, `gatsby-plugin-console-log`, configured in two different ways. The plugin logs a message to the console when you run `gatsby develop`.

In the first instance, `gatsby-plugin-console-log` is configured with options passed in and will display the custom message.

The second configuration does not include options, so the plugin will log a default message. You can read about adding local plugins [in the Gatsby docs](https://www.gatsbyjs.com/docs/loading-plugins-from-your-local-plugins-folder/).

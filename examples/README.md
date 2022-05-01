# Gatsby example websites

Example websites sit on one or the other end of the spectrum from very basic
to complex/complete.

A basic example website should demonstrate a specific technology/plugin/technique to help other developers understand how to accomplish a task. They should be named `using-*` (e.g. `using-sass`).

Complex/complete websites are for studying how to build more complex websites.

## Running an example site

1.  Enter one of the sites (e.g. `cd gatsbygram`)
2.  Install the dependencies for the site `npm install`
3.  Run the Gatsby development server `gatsby develop`

## Checklist for building an example website

- Free of errors
- Has Google Analytics setup
- Notifications setup to ping PRs on success/failure of build
- For `using-x` websites, link to the site from the plugin README and to the
  plugin(s) from the website.

## Building all the example websites

There's also a bash script in this folder called `build-all-examples.sh`, which automates the process of changing into each example folder, running `npm i`, and running `gatsby build`.

To execute this script, run the following commands from the terminal:

```sh
cd examples
./build-all-examples.sh > build-results.txt
```

🚨 WARNING: This script takes a LONG time to run. (Hours.)

---
title: Debugging HTML Builds
---


Errors while building static HTML files generally happen for two reasons.

1. Some of your code references "browser globals" like window or
document.  If this is your problem you should see an error above like
"window is not defined".  To fix this, find the offending code and either
a) check before calling the code if window is defined so the code doesn't
run while gatsby is building or b) if the code is in the render function
of a React.js component, move that code into "componentDidMount" which
ensures the code doesn't run unless it's in the browser.

2. Some other reason :-) #1 is the most common reason building static
files fail. If it's another reason, you have to be a bit more creative in
figuring out the problem.

If you look above at the stack trace, you'll see that all the file names
point to the same file, `render-page.js`. What is this? This is the
JavaScript bundle that Gatsby creates for rendering HTML. It takes all
the code and data for your site and puts it in big bundle and then uses
that to generate all the HTML.

Normally Gatsby deletes the file after building HTML is finished so you'd
never see it. But since the build failed, it's still around and you can
use it to help debug why your build failed.

So let's open the file and dive in.

The `render-page.js` file is in the "public" directory in your site directory
at `public/render-page.js`. Open it up and then navigate to the line number
listed in the first stack trace.  So if that line says something like:

```shell
ReferenceError: window is not defined at Object.render
(render-page.js:53450:6)
```

Then go to line number 53450

Here it gets a bit tricky. Once at that line, you'll need to figure out where
in your codebase the code is from. Sometimes it's your own code and that's
easy. But other times, the offending code is from a module that you require or
worse 😱, a module many requires away from your code in some obscure module.

In this worst case scenario, you can either grep node_modules for the
code or you can start back tracking up the stack trace (i.e. go to line
number in the next referenced line) until you find code you recognize and
work from there.

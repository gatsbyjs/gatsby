module.exports = {
  stack: `ReferenceError: window is not defined
    at BlogPostRoute.render (<HOME_DIR>/programs/blog/public/webpack:/lib/fixtures/blog-post.js:16:17)
    at processChild (<HOME_DIR>/programs/blog/node_modules/react-dom/cjs/react-dom-server.node.development.js:3134:18)
    at resolve (<HOME_DIR>/programs/blog/node_modules/react-dom/cjs/react-dom-server.node.development.js:2960:5)
    at ReactDOMServerRenderer.render (<HOME_DIR>/programs/blog/node_modules/react-dom/cjs/react-dom-server.node.development.js:3435:22)
    at ReactDOMServerRenderer.read (<HOME_DIR>/programs/blog/node_modules/react-dom/cjs/react-dom-server.node.development.js:3373:29)
    at renderToString (<HOME_DIR>/programs/blog/node_modules/react-dom/cjs/react-dom-server.node.development.js:3988:27)
    at Module.default (<HOME_DIR>/programs/blog/public/webpack:/lib/.cache/develop-static-entry.js:248:32)
    at <HOME_DIR>/programs/blog/node_modules/gatsby/src/utils/worker/render-html.ts:32:11
    at <HOME_DIR>/programs/blog/node_modules/gatsby/src/utils/worker/render-html.ts:25:7
From previous event:
    at renderHTML (<HOME_DIR>/programs/blog/node_modules/gatsby/src/utils/worker/render-html.ts:22:18)
    at <HOME_DIR>/programs/blog/node_modules/gatsby/src/utils/develop-html-route.ts:140:36
    at Layer.handle [as handle_request] (<HOME_DIR>/programs/blog/node_modules/express/lib/router/layer.js:95:5)
    at next (<HOME_DIR>/programs/blog/node_modules/express/lib/router/route.js:137:13)
    at Route.dispatch (<HOME_DIR>/programs/blog/node_modules/express/lib/router/route.js:112:3)
    at Layer.handle [as handle_request] (<HOME_DIR>/programs/blog/node_modules/express/lib/router/layer.js:95:5)
    at <HOME_DIR>/programs/blog/node_modules/express/lib/router/index.js:281:22
    at param (<HOME_DIR>/programs/blog/node_modules/express/lib/router/index.js:354:14)
    at param (<HOME_DIR>/programs/blog/node_modules/express/lib/router/index.js:365:14)
    at Function.process_params (<HOME_DIR>/programs/blog/node_modules/express/lib/router/index.js:410:3)
    at next (<HOME_DIR>/programs/blog/node_modules/express/lib/router/index.js:275:10)
    at cors (<HOME_DIR>/programs/blog/node_modules/cors/lib/index.js:188:7)
    at <HOME_DIR>/programs/blog/node_modules/cors/lib/index.js:224:17
    at originCallback (<HOME_DIR>/programs/blog/node_modules/cors/lib/index.js:214:15)
    at <HOME_DIR>/programs/blog/node_modules/cors/lib/index.js:219:13
    at optionsCallback (<HOME_DIR>/programs/blog/node_modules/cors/lib/index.js:199:9)
    at corsMiddleware (<HOME_DIR>/programs/blog/node_modules/cors/lib/index.js:204:7)
    at Layer.handle [as handle_request] (<HOME_DIR>/programs/blog/node_modules/express/lib/router/layer.js:95:5)`,
  message: `window is not defined`,
  type: `ReferenceError`,
}

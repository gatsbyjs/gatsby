import NProgress from "nprogress"

exports.onClientEntry = (a, pluginOptions = { color: `#29d` }) => {
  window.___emitter.on(`onDelayedLoadPageResources`, () => {
    NProgress.configure(pluginOptions)
    NProgress.start()
  })
  window.___emitter.on(`onPostLoadPageResources`, () => {
    NProgress.done()
  })

  // Inject styles.
  const styles = `#nprogress {
    pointer-events: none;
}
#nprogress .bar {
    background: ${pluginOptions.color};
    position: fixed;
    z-index: 1031;
    top: 0;
    left: 0;
    width: 100%;
    height: 2px;
}
#nprogress .peg {
    display: block;
    position: absolute;
    right: 0px;
    width: 100px;
    height: 100%;
    box-shadow: 0 0 10px ${pluginOptions.color}, 0 0 5px ${pluginOptions.color};
    opacity: 1.0;
    -webkit-transform: rotate(3deg) translate(0px, -4px);
    -ms-transform: rotate(3deg) translate(0px, -4px);
    transform: rotate(3deg) translate(0px, -4px);
}
#nprogress .spinner {
    display: block;
    position: fixed;
    z-index: 1031;
    top: 15px;
    right: 15px;
}
#nprogress .spinner-icon {
    width: 18px;
    height: 18px;
    box-sizing: border-box;
    border: solid 2px transparent;
    border-top-color: ${pluginOptions.color};
    border-left-color: ${pluginOptions.color};
    border-radius: 50%;
    -webkit-animation: nprogress-spinner 400ms linear infinite;
    animation: nprogress-spinner 400ms linear infinite;
}
.nprogress-custom-parent {
    overflow: hidden;
    position: relative;
}
.nprogress-custom-parent #nprogress .spinner,
.nprogress-custom-parent #nprogress .bar {
    position: absolute;
}
@-webkit-keyframes nprogress-spinner {
    0% {
        -webkit-transform: rotate(0deg);
    }
    100% {
        -webkit-transform: rotate(360deg);
    }
}
@keyframes nprogress-spinner {
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
}
`

  const node = document.createElement(`style`)
  node.id = `nprogress-styles`
  node.innerHTML = styles
  document.head.appendChild(node)
}

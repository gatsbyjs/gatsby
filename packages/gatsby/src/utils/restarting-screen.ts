// noop fn to be used as a tagged template literal for code highlighting and prettier formatting
const html = (html: TemplateStringsArray): string => html.join(`\n`)

export default html`
  <html>
    <head>
      <title>Restarting...</title>
      <style>
        .wrapper {
          width: 100vw;
          height: 100vh;
          position: absolute;
          top: 0;
          left: 0;
          background: white;
          display: -webkit-box;
          display: -webkit-flex;
          display: -ms-flexbox;
          display: flex;
          -webkit-flex-direction: column;
          -ms-flex-direction: column;
          flex-direction: column;
          -webkit-align-items: center;
          -webkit-box-align: center;
          -ms-flex-align: center;
          align-items: center;
          -webkit-box-pack: center;
          -webkit-justify-content: center;
          -ms-flex-pack: center;
          justify-content: center;
          color: rebeccapurple;
          font-family: "Futura PT", -apple-system, "BlinkMacSystemFont",
            "Segoe UI", "Roboto", "Helvetica Neue", "Arial", "Noto Sans",
            sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol",
            "Noto Color Emoji";
          text-align: center;
        }
      </style>
      <style>
        .logo {
          height: 64px;
          width: auto;
          box-shadow: 0 0 0 rgba(102, 51, 153, 0.4);
          -webkit-animation: pulse 2s infinite;
          animation: pulse 2s infinite;
          border-radius: 50%;
        }
        @-webkit-keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(102, 51, 153, 0.4);
          }
          70% {
            box-shadow: 0 0 0 30px rgba(102, 51, 153, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(102, 51, 153, 0);
          }
        }
        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(102, 51, 153, 0.4);
          }
          70% {
            box-shadow: 0 0 0 30px rgba(102, 51, 153, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(102, 51, 153, 0);
          }
        }
      </style>
    </head>
    <body data-cy="restarting-screen">
      <div class="wrapper">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 28 28"
          focusable="false"
          class="logo"
        >
          <title>Gatsby</title>
          <circle cx="14" cy="14" r="14" fill="#639"></circle>
          <path
            fill="#fff"
            d="M6.2 21.8C4.1 19.7 3 16.9 3 14.2L13.9 25c-2.8-.1-5.6-1.1-7.7-3.2zm10.2 2.9L3.3 11.6C4.4 6.7 8.8 3 14 3c3.7 0 6.9 1.8 8.9 4.5l-1.5 1.3C19.7 6.5 17 5 14 5c-3.9 0-7.2 2.5-8.5 6L17 22.5c2.9-1 5.1-3.5 5.8-6.5H18v-2h7c0 5.2-3.7 9.6-8.6 10.7z"
          ></path>
        </svg>
        <h1>Gatsby is restarting the develop server...</h1>
        <script src="/socket.io/socket.io.js"></script>
        <script>
          fetch("/___services")
            .then(res => res.json())
            .then(services => {
              const socket = io(
                "http://" +
                  window.location.hostname +
                  ":" +
                  services.developstatusserver.port
              )
              socket.on("structured-log", msg => {
                if (msg.type !== "LOG_ACTION") return

                if (
                  msg.action.type === "SET_STATUS" &&
                  msg.action.payload === "SUCCESS"
                ) {
                  window.location.reload()
                }

                if (
                  msg.action.type === "DEVELOP" &&
                  msg.action.payload === "RESTART_REQUIRED"
                ) {
                  socket.emit("develop:restart")
                }
              })

              socket.on("disconnect", () => {
                console.warn(
                  "[socket.io] Disconnected. Unable to perform health-check."
                )
                socket.close()
              })
            })
        </script>
      </div>
    </body>
  </html>
`

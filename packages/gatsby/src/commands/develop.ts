// NOTE(@mxstbr): Do not use the reporter in this file, as that has side-effects on import which break structured logging
import path from "path"
import http from "http"
import https from "https"
import tmp from "tmp"
import { ChildProcess } from "child_process"
import execa from "execa"
import chokidar from "chokidar"
import getRandomPort from "detect-port"
import { detectPortInUseAndPrompt } from "../utils/detect-port-in-use-and-prompt"
import { Server as SocketIO } from "socket.io"
import fs from "fs-extra"
import onExit from "signal-exit"
import {
  isCI,
  slash,
  createServiceLock,
  getService,
  updateSiteMetadata,
  UnlockFn,
} from "gatsby-core-utils"
import reporter from "gatsby-cli/lib/reporter"
import { getSslCert } from "../utils/get-ssl-cert"
import { IProxyControls, startDevelopProxy } from "../utils/develop-proxy"
import { IProgram, IDebugInfo } from "./types"
import { flush as telemetryFlush } from "gatsby-telemetry"

// Adapted from https://stackoverflow.com/a/16060619
const requireUncached = (file: string): any => {
  try {
    delete require.cache[require.resolve(file)]
  } catch (e) {
    return null
  }

  try {
    return require(file)
  } catch (e) {
    return null
  }
}

// Heuristics for gatsby-config.js, as not all changes to it require a full restart to take effect
const doesConfigChangeRequireRestart = (
  lastConfig: Record<string, any>,
  newConfig: Record<string, any>
): boolean => {
  // Ignore changes to siteMetadata
  const replacer = (_, v): string | void => {
    if (typeof v === `function` || v instanceof RegExp) {
      return v.toString()
    } else {
      return v
    }
  }

  const oldConfigString = JSON.stringify(
    { ...lastConfig, siteMetadata: null },
    replacer
  )
  const newConfigString = JSON.stringify(
    { ...newConfig, siteMetadata: null },
    replacer
  )

  if (oldConfigString === newConfigString) return false

  return true
}

// Return a user-supplied port otherwise the default Node.js debugging port
const getDebugPort = (port?: number): number => port ?? 9229

export const getDebugInfo = (program: IProgram): IDebugInfo | null => {
  if (Object.prototype.hasOwnProperty.call(program, `inspect`)) {
    return {
      port: getDebugPort(program.inspect),
      break: false,
    }
  } else if (Object.prototype.hasOwnProperty.call(program, `inspectBrk`)) {
    return {
      port: getDebugPort(program.inspectBrk),
      break: true,
    }
  } else {
    return null
  }
}

class ControllableScript {
  private process?: ChildProcess
  private script
  private debugInfo: IDebugInfo | null
  public isRunning
  constructor(script, debugInfo: IDebugInfo | null) {
    this.script = script
    this.debugInfo = debugInfo
  }
  start(): void {
    const args: Array<string> = []
    const tmpFileName = tmp.tmpNameSync({
      tmpdir: path.join(process.cwd(), `.cache`),
    })
    fs.outputFileSync(tmpFileName, this.script)
    this.isRunning = true
    // Passing --inspect isn't necessary for the child process to launch a port but it allows some editors to automatically attach
    if (this.debugInfo) {
      if (this.debugInfo.break) {
        args.push(`--inspect-brk=${this.debugInfo.port}`)
      } else {
        args.push(`--inspect=${this.debugInfo.port}`)
      }
    }

    this.process = execa.node(tmpFileName, args, {
      env: process.env,
      stdio: [`inherit`, `inherit`, `inherit`, `ipc`],
    })
  }
  async stop(
    signal: NodeJS.Signals | null = null,
    code?: number
  ): Promise<void> {
    if (!this.process) {
      throw new Error(`Trying to stop the process before starting it`)
    }

    this.isRunning = false
    try {
      if (signal) {
        this.process.kill(signal)
      } else {
        this.process.send({
          type: `COMMAND`,
          action: {
            type: `EXIT`,
            payload: code,
          },
        })
      }
    } catch (err) {
      // Ignore error if process has crashed or already quit.
      // Ref: https://github.com/gatsbyjs/gatsby/issues/28011#issuecomment-877302917
    }

    return new Promise(resolve => {
      if (!this.process) {
        throw new Error(`Trying to stop the process before starting it`)
      }

      this.process.on(`exit`, () => {
        if (this.process) {
          this.process.removeAllListeners()
        }
        this.process = undefined
        resolve()
      })
    })
  }
  onMessage(callback: (msg: any) => void): void {
    if (!this.process) {
      throw new Error(`Trying to attach message handler before process started`)
    }
    this.process.on(`message`, callback)
  }
  onExit(
    callback: (code: number | null, signal: NodeJS.Signals | null) => void
  ): void {
    if (!this.process) {
      throw new Error(`Trying to attach exit handler before process started`)
    }
    this.process.on(`exit`, callback)
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  send(msg: any): void {
    if (!this.process) {
      throw new Error(`Trying to send a message before process started`)
    }

    this.process.send(msg)
  }
}

let isRestarting

// checks if a string is a valid ip
const REGEX_IP = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])$/

module.exports = async (program: IProgram): Promise<void> => {
  // In some cases, port can actually be a string. But our codebase is expecting it to be a number.
  // So we want to early just force it to a number to ensure we always act on a correct type.
  program.port = parseInt(program.port + ``, 10)
  const developProcessPath = slash(require.resolve(`./develop-process`))
  const telemetryServerPath = slash(
    require.resolve(`../utils/telemetry-server`)
  )

  try {
    program.port = await detectPortInUseAndPrompt(program.port)
  } catch (e) {
    if (e.message === `USER_REJECTED`) {
      process.exit(0)
    }

    throw e
  }

  // Run the actual develop server on a random port, and the proxy on the program port
  // which users will access
  const proxyPort = program.port
  const debugInfo = getDebugInfo(program)

  const rootFile = (file: string): string => path.join(program.directory, file)

  // Require gatsby-config.js before accessing process.env, to enable the user to change
  // environment variables from the config file.
  let lastConfig = requireUncached(rootFile(`gatsby-config.js`))

  // INTERNAL_STATUS_PORT allows for setting the websocket port used for monitoring
  // when the browser should prompt the user to restart the develop process.
  // This port is randomized by default and in most cases should never be required to configure.
  // It is exposed for environments where port access needs to be explicit, such as with Docker.
  // As the port is meant for internal usage only, any attempt to interface with features
  // it exposes via third-party software is not supported.
  const [
    statusServerPort,
    developPort,
    telemetryServerPort,
  ] = await Promise.all([
    getRandomPort(process.env.INTERNAL_STATUS_PORT),
    getRandomPort(),
    getRandomPort(),
  ])

  // In order to enable custom ssl, --cert-file --key-file and -https flags must all be
  // used together
  if ((program[`cert-file`] || program[`key-file`]) && !program.https) {
    reporter.panic(
      `for custom ssl --https, --cert-file, and --key-file must be used together`
    )
  }

  // Check if https is enabled, then create or get SSL cert.
  // Certs are named 'devcert' and issued to the host.
  // NOTE(@mxstbr): We mutate program.ssl _after_ passing it
  // to the develop process controllable script above because
  // that would mean we double SSL browser => proxy => server
  if (program.https) {
    const sslHost =
      program.host === `0.0.0.0` || program.host === `::`
        ? `localhost`
        : program.host

    if (REGEX_IP.test(sslHost)) {
      reporter.panic(
        `You're trying to generate a ssl certificate for an IP (${sslHost}). Please use a hostname instead.`
      )
    }

    const ssl = await getSslCert({
      name: sslHost,
      caFile: program[`ca-file`],
      certFile: program[`cert-file`],
      keyFile: program[`key-file`],
      directory: program.directory,
    })

    if (ssl) {
      program.ssl = ssl
    }
  }

  // NOTE(@mxstbr): We need to start the develop proxy before the develop process to ensure
  // codesandbox detects the right port to expose by default
  const proxy = startDevelopProxy({
    proxyPort: proxyPort,
    targetPort: developPort,
    program,
  })

  const developProcess = new ControllableScript(
    `
    const cmd = require(${JSON.stringify(developProcessPath)});
    const args = ${JSON.stringify({
      ...program,
      port: developPort,
      proxyPort,
      // Don't pass SSL options down to the develop process, it should always use HTTP
      ssl: null,
      debugInfo,
    })};
    cmd(args);
  `,
    debugInfo
  )

  const telemetryServerProcess = new ControllableScript(
    `require(${JSON.stringify(telemetryServerPath)}).default(${JSON.stringify(
      telemetryServerPort
    )})`,
    null
  )

  let unlocks: Array<UnlockFn | null> = []
  if (!isCI()) {
    const statusUnlock = await createServiceLock(
      program.directory,
      `developstatusserver`,
      {
        port: statusServerPort,
      }
    )
    const developUnlock = await createServiceLock(
      program.directory,
      `developproxy`,
      {
        port: proxyPort,
      }
    )
    const telemetryUnlock = await createServiceLock(
      program.directory,
      `telemetryserver`,
      {
        port: telemetryServerPort,
      }
    )
    await updateSiteMetadata({
      name: program.sitePackageJson.name,
      sitePath: program.directory,
      pid: process.pid,
      lastRun: Date.now(),
    })

    if (!statusUnlock || !developUnlock) {
      const data = await getService(program.directory, `developproxy`)
      const port = data?.port || 8000
      console.error(
        `Looks like develop for this site is already running, can you visit ${
          program.ssl ? `https:` : `http:`
        }//localhost:${port} ? If it is not, try again in five seconds!`
      )
      process.exit(1)
    }

    unlocks = unlocks.concat([statusUnlock, developUnlock, telemetryUnlock])
  }

  const statusServer = program.ssl
    ? https.createServer(program.ssl)
    : http.createServer()
  statusServer.listen(statusServerPort)

  const io = new SocketIO(statusServer, {
    // whitelist all (https://github.com/expressjs/cors#configuration-options)
    cors: {
      origin: true,
    },
    cookie: true,
  })

  const handleChildProcessIPC = (msg): void => {
    if (msg.type === `HEARTBEAT`) return
    if (process.send) {
      // Forward IPC
      process.send(msg)
    }

    io.emit(`structured-log`, msg)

    if (
      msg.type === `LOG_ACTION` &&
      msg.action.type === `SET_STATUS` &&
      msg.action.payload === `SUCCESS`
    ) {
      proxy.serveSite()
    }
  }

  io.on(`connection`, socket => {
    socket.on(`develop:restart`, async respond => {
      isRestarting = true
      proxy.serveRestartingScreen()
      // respond() responds to the client, which in our case prompts it to reload the page to show the restarting screen
      if (respond) respond(`develop:is-starting`)
      await developProcess.stop()
      developProcess.start()
      developProcess.onMessage(handleChildProcessIPC)
      isRestarting = false
    })
  })

  developProcess.start()
  developProcess.onMessage(handleChildProcessIPC)

  telemetryServerProcess.start()

  // Plugins can call `process.exit` which would be sent to `develop-process` (child process)
  // This needs to be propagated back to the parent process
  developProcess.onExit(
    (code: number | null, signal: NodeJS.Signals | null) => {
      try {
        telemetryFlush()
      } catch (e) {
        // nop
      }
      if (isRestarting) return
      if (signal !== null) {
        process.kill(process.pid, signal)
        return
      }
      if (code !== null) {
        process.exit(code)
      }

      // This should not happen:
      // https://nodejs.org/api/child_process.html#child_process_event_exit
      // The 'exit' event is emitted after the child process ends. If the process
      // exited, code is the final exit code of the process, otherwise null.
      // If the process terminated due to receipt of a signal, signal is the
      // string name of the signal, otherwise null. One of the two will always be
      // non - null.
      //
      // but just in case let do non-zero exit, because we are in situation
      // we don't expect to be possible
      process.exit(1)
    }
  )

  const files = [rootFile(`gatsby-config.js`), rootFile(`gatsby-node.js`)]
  let watcher: chokidar.FSWatcher

  if (!isCI()) {
    watcher = chokidar.watch(files).on(`change`, filePath => {
      const file = path.basename(filePath)

      if (file === `gatsby-config.js`) {
        const newConfig = requireUncached(rootFile(`gatsby-config.js`))

        if (!doesConfigChangeRequireRestart(lastConfig, newConfig)) {
          lastConfig = newConfig
          return
        }

        lastConfig = newConfig
      }

      console.warn(
        `develop process needs to be restarted to apply the changes to ${file}`
      )
      io.emit(`structured-log`, {
        type: `LOG_ACTION`,
        action: {
          type: `DEVELOP`,
          payload: `RESTART_REQUIRED`,
          dirtyFile: file,
        },
      })
    })
  }

  // route ipc messaging to the original develop process
  process.on(`message`, msg => {
    developProcess.send(msg)
  })

  process.on(`SIGINT`, async () => {
    await shutdownServices(
      {
        developProcess,
        telemetryServerProcess,
        unlocks,
        statusServer,
        proxy,
        watcher,
      },
      `SIGINT`
    )

    process.exit(0)
  })

  process.on(`SIGTERM`, async () => {
    await shutdownServices(
      {
        developProcess,
        telemetryServerProcess,
        unlocks,
        statusServer,
        proxy,
        watcher,
      },
      `SIGTERM`
    )

    process.exit(0)
  })

  onExit((_code, signal) => {
    shutdownServices(
      {
        developProcess,
        telemetryServerProcess,
        unlocks,
        statusServer,
        proxy,
        watcher,
      },
      signal as NodeJS.Signals
    )
  })
}

interface IShutdownServicesOptions {
  statusServer: https.Server | http.Server
  developProcess: ControllableScript
  proxy: IProxyControls
  unlocks: Array<UnlockFn | null>
  watcher: chokidar.FSWatcher
  telemetryServerProcess: ControllableScript
}

function shutdownServices(
  {
    statusServer,
    developProcess,
    proxy,
    unlocks,
    watcher,
    telemetryServerProcess,
  }: IShutdownServicesOptions,
  signal: NodeJS.Signals
): Promise<void> {
  try {
    telemetryFlush()
  } catch (e) {
    // nop
  }
  const services = [
    developProcess.stop(signal),
    telemetryServerProcess.stop(),
    watcher?.close(),
    new Promise(resolve => statusServer.close(resolve)),
    new Promise(resolve => proxy.server.close(resolve)),
  ]

  unlocks.forEach(unlock => {
    if (unlock) {
      services.push(unlock())
    }
  })

  return Promise.all(services)
    .catch(() => {})
    .then(() => {})
}

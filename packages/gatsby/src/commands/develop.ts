// NOTE(@mxstbr): Do not use the reporter in this file, as that has side-effects on import which break structured logging
import path from "path"
import http from "http"
import tmp from "tmp"
import { spawn, ChildProcess } from "child_process"
import chokidar from "chokidar"
import getRandomPort from "detect-port"
import { detectPortInUseAndPrompt } from "../utils/detect-port-in-use-and-prompt"
import socket from "socket.io"
import fs from "fs-extra"
import { isCI, slash } from "gatsby-core-utils"
import { createServiceLock } from "gatsby-core-utils/dist/service-lock"
import { UnlockFn } from "gatsby-core-utils/src/service-lock"
import reporter from "gatsby-cli/lib/reporter"
import { getSslCert } from "../utils/get-ssl-cert"
import { startDevelopProxy } from "../utils/develop-proxy"
import { IProgram, IDebugInfo } from "./types"

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
  if (program.hasOwnProperty(`inspect`)) {
    return {
      port: getDebugPort(program.inspect),
      break: false,
    }
  } else if (program.hasOwnProperty(`inspectBrk`)) {
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
    const tmpFileName = tmp.tmpNameSync({
      tmpdir: path.join(process.cwd(), `.cache`),
    })
    fs.outputFileSync(tmpFileName, this.script)
    this.isRunning = true
    const args = [tmpFileName]
    // Passing --inspect isn't necessary for the child process to launch a port but it allows some editors to automatically attach
    if (this.debugInfo) {
      args.push(
        this.debugInfo.break
          ? `--inspect-brk=${this.debugInfo.port}`
          : `--inspect=${this.debugInfo.port}`
      )
    }

    this.process = spawn(`node`, args, {
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
      throw new Error(`Trying to attach message handler before process starter`)
    }
    this.process.on(`message`, callback)
  }
  onExit(
    callback: (code: number | null, signal: NodeJS.Signals | null) => void
  ): void {
    if (!this.process) {
      throw new Error(`Trying to attach exit handler before process starter`)
    }
    this.process.on(`exit`, callback)
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
  const [statusServerPort, developPort] = await Promise.all([
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

  let unlocks: Array<UnlockFn> = []
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

    if (!statusUnlock || !developUnlock) {
      console.error(
        `Looks like develop for this site is already running. Try visiting http://localhost:8000/ maybe?`
      )
      process.exit(1)
    }

    unlocks = unlocks.concat([statusUnlock, developUnlock])
  }

  const statusServer = http.createServer().listen(statusServerPort)
  const io = socket(statusServer)

  const handleChildProcessIPC = (msg): void => {
    if (msg.type === `HEARTBEAT`) return
    if (process.send) {
      // Forward IPC
      process.send(msg)
    }

    if (
      msg.type === `LOG_ACTION` &&
      msg.action.type === `SET_STATUS` &&
      msg.action.payload === `SUCCESS`
    ) {
      proxy.serveSite()
      io.emit(`develop:started`)
    }
  }

  io.on(`connection`, socket => {
    socket.on(`develop:restart`, async () => {
      isRestarting = true
      proxy.serveRestartingScreen()
      io.emit(`develop:is-starting`)
      await developProcess.stop()
      developProcess.start()
      developProcess.onMessage(handleChildProcessIPC)
      isRestarting = false
    })
  })

  developProcess.start()
  developProcess.onMessage(handleChildProcessIPC)

  // Plugins can call `process.exit` which would be sent to `develop-process` (child process)
  // This needs to be propagated back to the parent process
  developProcess.onExit(
    (code: number | null, signal: NodeJS.Signals | null) => {
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

  const rootFile = (file: string): string => path.join(program.directory, file)

  const files = [rootFile(`gatsby-config.js`), rootFile(`gatsby-node.js`)]
  let lastConfig = requireUncached(rootFile(`gatsby-config.js`))

  let watcher

  if (!isCI()) {
    chokidar.watch(files).on(`change`, filePath => {
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
      io.emit(`develop:needs-restart`, {
        dirtyFile: file,
      })
    })
  }

  process.on(`beforeExit`, async () => {
    await Promise.all([
      watcher?.close(),
      ...unlocks.map(unlock => unlock()),
      new Promise(resolve => {
        statusServer.close(resolve)
      }),
      new Promise(resolve => {
        proxy.server.close(resolve)
      }),
    ])
  })

  process.on(`SIGINT`, async () => {
    await developProcess.stop(`SIGINT`)
    process.exit()
  })

  process.on(`SIGTERM`, async () => {
    await developProcess.stop(`SIGTERM`)
    process.exit()
  })
}

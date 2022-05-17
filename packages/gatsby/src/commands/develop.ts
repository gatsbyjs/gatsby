// NOTE(@mxstbr): Do not use the reporter in this file, as that has side-effects on import which break structured logging
import path from "path"
import tmp from "tmp"
import { ChildProcess } from "child_process"
import execa from "execa"
import { detectPortInUseAndPrompt } from "../utils/detect-port-in-use-and-prompt"
import fs from "fs-extra"
import onExit from "signal-exit"
import { v4 } from "gatsby-core-utils/uuid"
import { slash } from "gatsby-core-utils/path"
import reporter from "gatsby-cli/lib/reporter"
import { getSslCert } from "../utils/get-ssl-cert"
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
      env: {
        ...process.env,
        GATSBY_NODE_GLOBALS: JSON.stringify(global.__GATSBY ?? {}),
      },
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
        this.process.send(
          {
            type: `COMMAND`,
            action: {
              type: `EXIT`,
              payload: code,
            },
          },
          () => {
            // The try/catch won't suffice for this process.send
            // So use the callback to manually catch the Error, otherwise it'll be thrown
            // Ref: https://nodejs.org/api/child_process.html#child_process_subprocess_send_message_sendhandle_options_callback
          }
        )
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
const REGEX_IP =
  /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])$/

module.exports = async (program: IProgram): Promise<void> => {
  global.__GATSBY = {
    buildId: v4(),
    root: program.directory,
  }

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
  const debugInfo = getDebugInfo(program)

  const rootFile = (file: string): string => path.join(program.directory, file)

  // Require gatsby-config.js before accessing process.env, to enable the user to change
  // environment variables from the config file.
  requireUncached(rootFile(`gatsby-config`))

  const developPort = program.port

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

  const developProcess = new ControllableScript(
    `
    const cmd = require(${JSON.stringify(developProcessPath)});
    const args = ${JSON.stringify({
      ...program,
      port: developPort,
      // TODO(v5): remove
      proxyPort: developPort,
      // Don't pass SSL options down to the develop process, it should always use HTTP
      ssl: null,
      debugInfo,
    })};
    cmd(args);
  `,
    debugInfo
  )

  const handleChildProcessIPC = (msg): void => {
    if (msg.type === `HEARTBEAT`) return
    if (process.send) {
      // Forward IPC
      process.send(msg)
    }
  }

  developProcess.start()
  developProcess.onMessage(handleChildProcessIPC)

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

  process.on(`SIGINT`, async () => {
    await shutdownServices(
      {
        developProcess,
      },
      `SIGINT`
    )

    process.exit(0)
  })

  process.on(`SIGTERM`, async () => {
    await shutdownServices(
      {
        developProcess,
      },
      `SIGTERM`
    )

    process.exit(0)
  })

  onExit((_code, signal) => {
    shutdownServices(
      {
        developProcess,
      },
      signal as NodeJS.Signals
    )
  })
}

interface IShutdownServicesOptions {
  developProcess: ControllableScript
}

function shutdownServices(
  { developProcess }: IShutdownServicesOptions,
  signal: NodeJS.Signals
): Promise<void> {
  try {
    telemetryFlush()
  } catch (e) {
    // nop
  }
  const services = [developProcess.stop(signal)]

  return Promise.all(services)
    .catch(() => {})
    .then(() => {})
}

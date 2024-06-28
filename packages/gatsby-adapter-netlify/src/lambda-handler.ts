import type { IFunctionDefinition } from "gatsby"
import packageJson from "gatsby-adapter-netlify/package.json"
import fs from "fs-extra"
import * as path from "path"
import { slash } from "gatsby-core-utils/path"

interface INetlifyFunctionConfig {
  externalNodeModules?: Array<string>
  includedFiles?: Array<string>
  includedFilesBasePath?: string
  ignoredNodeModules?: Array<string>
  nodeBundler?: "esbuild" | "esbuild_zisi" | "nft" | "zisi" | "none"
  nodeSourcemap?: boolean
  nodeVersion?: string
  processDynamicNodeImports?: boolean
  rustTargetDirectory?: string
  schedule?: string
  zipGo?: boolean
  name?: string
  generator?: string
  nodeModuleFormat?: "cjs" | "esm"
}

interface INetlifyFunctionManifest {
  config: INetlifyFunctionConfig
  version: number
}

export async function prepareFunction(
  fun: IFunctionDefinition,
  odbfunctionName?: string
): Promise<void> {
  let functionId = fun.functionId
  let isODB = false

  if (odbfunctionName) {
    functionId = odbfunctionName
    isODB = true
  }

  const internalFunctionsDir = path.join(
    process.cwd(),
    `.netlify`,
    `functions-internal`,
    functionId
  )

  await fs.ensureDir(internalFunctionsDir)

  // This is a temporary hacky approach, eventually it should be just `fun.name`
  const displayName = isODB
    ? `DSG`
    : fun.name === `SSR & DSG`
    ? `SSR`
    : fun.name

  const functionManifest: INetlifyFunctionManifest = {
    config: {
      name: displayName,
      generator: `gatsby-adapter-netlify@${packageJson?.version ?? `unknown`}`,
      includedFiles: fun.requiredFiles.map(file =>
        slash(file).replace(/\[/g, `*`).replace(/]/g, `*`)
      ),
      includedFilesBasePath: process.cwd(),
      externalNodeModules: [`msgpackr-extract`],
    },
    version: 1,
  }

  await fs.writeJSON(
    path.join(internalFunctionsDir, `${functionId}.json`),
    functionManifest
  )

  function getRelativePathToModule(modulePath: string): string {
    const absolutePath = require.resolve(modulePath)

    return (
      `./` +
      path.posix.relative(slash(internalFunctionsDir), slash(absolutePath))
    )
  }

  const handlerSource = /* javascript */ `
const Stream = require("stream")
const http = require("http")
const { Buffer } = require("buffer")
const cookie = require("${getRelativePathToModule(`cookie`)}")
${
  isODB
    ? `const { builder } = require("${getRelativePathToModule(
        `@netlify/functions`
      )}")`
    : ``
}

const preferDefault = m => (m && m.default) || m

const functionModule = require("${getRelativePathToModule(
    path.join(process.cwd(), fun.pathToEntryPoint)
  )}")

const functionHandler = preferDefault(functionModule)

const statuses = {
  "100": "Continue",
  "101": "Switching Protocols",
  "102": "Processing",
  "103": "Early Hints",
  "200": "OK",
  "201": "Created",
  "202": "Accepted",
  "203": "Non-Authoritative Information",
  "204": "No Content",
  "205": "Reset Content",
  "206": "Partial Content",
  "207": "Multi-Status",
  "208": "Already Reported",
  "226": "IM Used",
  "300": "Multiple Choices",
  "301": "Moved Permanently",
  "302": "Found",
  "303": "See Other",
  "304": "Not Modified",
  "305": "Use Proxy",
  "307": "Temporary Redirect",
  "308": "Permanent Redirect",
  "400": "Bad Request",
  "401": "Unauthorized",
  "402": "Payment Required",
  "403": "Forbidden",
  "404": "Not Found",
  "405": "Method Not Allowed",
  "406": "Not Acceptable",
  "407": "Proxy Authentication Required",
  "408": "Request Timeout",
  "409": "Conflict",
  "410": "Gone",
  "411": "Length Required",
  "412": "Precondition Failed",
  "413": "Payload Too Large",
  "414": "URI Too Long",
  "415": "Unsupported Media Type",
  "416": "Range Not Satisfiable",
  "417": "Expectation Failed",
  "418": "I'm a Teapot",
  "421": "Misdirected Request",
  "422": "Unprocessable Entity",
  "423": "Locked",
  "424": "Failed Dependency",
  "425": "Too Early",
  "426": "Upgrade Required",
  "428": "Precondition Required",
  "429": "Too Many Requests",
  "431": "Request Header Fields Too Large",
  "451": "Unavailable For Legal Reasons",
  "500": "Internal Server Error",
  "501": "Not Implemented",
  "502": "Bad Gateway",
  "503": "Service Unavailable",
  "504": "Gateway Timeout",
  "505": "HTTP Version Not Supported",
  "506": "Variant Also Negotiates",
  "507": "Insufficient Storage",
  "508": "Loop Detected",
  "509": "Bandwidth Limit Exceeded",
  "510": "Not Extended",
  "511": "Network Authentication Required"
}

const createRequestObject = ({ event, context }) => {
  const {
    path = "",
    multiValueQueryStringParameters,
    queryStringParameters,
    httpMethod,
    multiValueHeaders = {},
    body,
    isBase64Encoded,
    rawUrl
  } = event
  const newStream = new Stream.Readable()
  const req = Object.assign(newStream, http.IncomingMessage.prototype)
  req.url = path
  req.originalUrl = req.url
  req.rawUrl = rawUrl
  req.query = queryStringParameters
  req.multiValueQuery = multiValueQueryStringParameters
  req.method = httpMethod
  req.rawHeaders = []
  req.headers = {}
  // Expose Netlify Function event and context on request object.
  req.netlifyFunctionParams = { event, context }
  for (const key of Object.keys(multiValueHeaders)) {
    for (const value of multiValueHeaders[key]) {
      req.rawHeaders.push(key, value)
    }
    req.headers[key.toLowerCase()] = multiValueHeaders[key].toString()
  }
  req.getHeader = name => req.headers[name.toLowerCase()]
  req.getHeaders = () => req.headers
  // Gatsby includes cookie middleware
  const cookies = req.headers.cookie
  if (cookies) {
    req.cookies = cookie.parse(cookies)
  }
  // req.connection = {}
  if (body) {
    req.push(body, isBase64Encoded ? "base64" : undefined)
  }
  req.push(null)
  return req
}

const createResponseObject = ({ onResEnd }) => {
  const response = {
    isBase64Encoded: true,
    multiValueHeaders: {},
  };
  const res = new Stream();
  Object.defineProperty(res, 'statusCode', {
    get() {
      return response.statusCode;
    },
    set(statusCode) {
      response.statusCode = statusCode;
    },
  });
  res.headers = { 'content-type': 'text/html; charset=utf-8' };
  res.writeHead = (status, headers) => {
    response.statusCode = status;
    if (headers) {
      res.headers = Object.assign(res.headers, headers);
    }
    // Return res object to allow for chaining
    // Fixes: https://github.com/netlify/next-on-netlify/pull/74
    return res;
  };
  res.write = (chunk) => {
    if (!response.body) {
      response.body = Buffer.from('');
    }
    response.body = Buffer.concat([
      Buffer.isBuffer(response.body)
        ? response.body
        : Buffer.from(response.body),
      Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk),
    ]);
    return true;
  };
  res.setHeader = (name, value) => {
    res.headers[name.toLowerCase()] = value;
    return res;
  };
  res.removeHeader = (name) => {
    delete res.headers[name.toLowerCase()];
  };
  res.getHeader = (name) => res.headers[name.toLowerCase()];
  res.getHeaders = () => res.headers;
  res.hasHeader = (name) => Boolean(res.getHeader(name));
  res.end = (text) => {
    if (text)
      res.write(text);
    if (!res.statusCode) {
      res.statusCode = 200;
    }
    if (response.body) {
      response.body = Buffer.from(response.body).toString('base64');
    }
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore These types are a mess, and need sorting out
    response.multiValueHeaders = res.headers;
    res.writeHead(response.statusCode);
    // Convert all multiValueHeaders into arrays
    for (const key of Object.keys(response.multiValueHeaders)) {
      const header = response.multiValueHeaders[key];
      if (!Array.isArray(header)) {
        response.multiValueHeaders[key] = [header];
      }
    }
    res.finished = true;
    res.writableEnded = true;
    // Call onResEnd handler with the response object
    onResEnd(response);
    return res;
  };
  // Gatsby Functions additions
  res.send = (data) => {
    if (res.finished) {
      return res;
    }
    if (typeof data === 'number') {
      return res
        .status(data)
        .setHeader('content-type', 'text/plain; charset=utf-8')
        .end(statuses[data] || String(data));
    }
    if (typeof data === 'boolean' || typeof data === 'object') {
      if (Buffer.isBuffer(data)) {
        res.setHeader('content-type', 'application/octet-Stream');
      }
      else if (data !== null) {
        return res.json(data);
      }
    }
    res.end(data);
    return res;
  };
  res.json = (data) => {
    if (res.finished) {
      return res;
    }
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify(data));
    return res;
  };
  res.status = (code) => {
    const numericCode = Number.parseInt(code);
    if (!Number.isNaN(numericCode)) {
      response.statusCode = numericCode;
    }
    return res;
  };
  res.redirect = (statusCodeOrUrl, url) => {
    let statusCode = statusCodeOrUrl;
    let Location = url;
    if (!url && typeof statusCodeOrUrl === 'string') {
      Location = statusCodeOrUrl;
      statusCode = 302;
    }
    res.writeHead(statusCode, { Location });
    res.end();
    return res;
  };
  return res;
};

const handler = async (event, context) => {
  const req = createRequestObject({ event, context })

  return new Promise(async resolve => {
    try {
      const res = createResponseObject({ onResEnd: resolve })
      await functionHandler(req, res)
    } catch(error) {
      console.error("Error executing " + event.path, error)
      resolve({ statusCode: 500 })
    }
  })
}

exports.handler = ${isODB ? `builder(handler)` : `handler`}
`

  await fs.writeFile(
    path.join(internalFunctionsDir, `${functionId}.js`),
    handlerSource
  )
}

export async function prepareFunctionVariants(
  fun: IFunctionDefinition,
  odbfunctionName?: string
): Promise<void> {
  await prepareFunction(fun)
  if (odbfunctionName) {
    await prepareFunction(fun, odbfunctionName)
  }
}

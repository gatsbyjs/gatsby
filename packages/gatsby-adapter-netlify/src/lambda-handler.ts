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

// Build a best-effort Lambda-style \`event\` from a web \`Request\` so that
// existing functions reading \`req.netlifyFunctionParams.event\` keep working.
const createCompatEvent = ({ request, url, bodyBuffer }) => {
  const queryStringParameters = {}
  const multiValueQueryStringParameters = {}
  for (const [key, value] of url.searchParams) {
    queryStringParameters[key] = value
    if (!multiValueQueryStringParameters[key]) {
      multiValueQueryStringParameters[key] = []
    }
    multiValueQueryStringParameters[key].push(value)
  }

  const headers = {}
  const multiValueHeaders = {}
  for (const [key, value] of request.headers) {
    headers[key] = value
    multiValueHeaders[key] = value.split(", ")
  }

  return {
    path: url.pathname,
    httpMethod: request.method,
    queryStringParameters,
    multiValueQueryStringParameters,
    headers,
    multiValueHeaders,
    body: bodyBuffer && bodyBuffer.length ? bodyBuffer.toString("base64") : null,
    isBase64Encoded: true,
    rawUrl: request.url,
  }
}

const createRequestObject = ({ request, context, url, bodyBuffer }) => {
  const newStream = new Stream.Readable()
  const req = Object.assign(newStream, http.IncomingMessage.prototype)
  req.url = url.pathname + url.search
  req.originalUrl = req.url
  req.rawUrl = request.url
  req.query = {}
  req.multiValueQuery = {}
  for (const [key, value] of url.searchParams) {
    req.query[key] = value
    if (!req.multiValueQuery[key]) {
      req.multiValueQuery[key] = []
    }
    req.multiValueQuery[key].push(value)
  }
  req.method = request.method
  req.rawHeaders = []
  req.headers = {}
  // Expose Netlify Function event and context on request object.
  req.netlifyFunctionParams = {
    event: createCompatEvent({ request, url, bodyBuffer }),
    context,
  }
  for (const [key, value] of request.headers) {
    req.rawHeaders.push(key, value)
    req.headers[key.toLowerCase()] = value
  }
  req.getHeader = name => req.headers[name.toLowerCase()]
  req.getHeaders = () => req.headers
  // Gatsby includes cookie middleware
  const cookies = req.headers.cookie
  if (cookies) {
    req.cookies = cookie.parse(cookies)
  }
  // req.connection = {}
  if (bodyBuffer && bodyBuffer.length) {
    req.push(bodyBuffer)
  }
  req.push(null)
  return req
}

const createResponseObject = ({ onResEnd }) => {
  const response = {};
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
    res.writeHead(response.statusCode);
    res.finished = true;
    res.writableEnded = true;
    // Call onResEnd handler with the collected status, headers and body buffer.
    onResEnd({
      statusCode: response.statusCode,
      headers: res.headers,
      body: response.body,
    });
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

const buildResponse = ({ statusCode, headers, body }) => {
  const responseHeaders = new Headers()
  for (const key of Object.keys(headers)) {
    const value = headers[key]
    if (Array.isArray(value)) {
      for (const item of value) {
        responseHeaders.append(key, item)
      }
    } else {
      responseHeaders.set(key, value)
    }
  }
${
  isODB
    ? `  // DSG responses are rendered once and then served from the Netlify
  // durable CDN cache, reproducing the behavior of the previous On-Demand
  // Builder (rendered content persists across requests until purged).
  responseHeaders.set("Netlify-CDN-Cache-Control", "public, durable, max-age=31536000, must-revalidate")
`
    : ``
}  return new Response(body ?? null, { status: statusCode, headers: responseHeaders })
}

const handler = async (request, context) => {
  const url = new URL(request.url)
  const bodyBuffer =
    request.body && request.method !== "GET" && request.method !== "HEAD"
      ? Buffer.from(await request.arrayBuffer())
      : undefined
  const req = createRequestObject({ request, context, url, bodyBuffer })

  return new Promise(async resolve => {
    try {
      const res = createResponseObject({
        onResEnd: result => resolve(buildResponse(result)),
      })
      await functionHandler(req, res)
    } catch(error) {
      console.error("Error executing " + url.pathname, error)
      resolve(new Response(null, { status: 500 }))
    }
  })
}

module.exports = handler
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

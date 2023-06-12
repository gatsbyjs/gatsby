import type { IFunctionDefinition } from "gatsby/src/utils/adapter/types"

import fs from "fs-extra"
import * as path from "path"

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

async function prepareFunction(
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

  const functionManifest: INetlifyFunctionManifest = {
    config: {
      includedFiles: fun.requiredFiles.map(file =>
        file.replace(/\[/g, `*`).replace(/]/g, `*`)
      ),
      externalNodeModules: [`msgpackr-extract`],
    },
    version: 1,
  }

  await fs.writeJSON(
    path.join(internalFunctionsDir, `${functionId}.json`),
    functionManifest
  )

  const handlerSource = /* javascript */ `
const Stream = require("stream")
const http = require("http")
const { Buffer } = require("buffer")
const cookie = require("cookie")
${isODB ? `const { builder } = require("@netlify/functions")` : ``}

const preferDefault = m => (m && m.default) || m

const functionModule = require("./../../../${fun.pathToEntryPoint}")

const functionHandler = preferDefault(functionModule)

const createRequestObject = ({ event, context }) => {
  const {
    path = "",
    multiValueQueryStringParameters,
    queryStringParameters,
    httpMethod,
    multiValueHeaders = {},
    body,
    isBase64Encoded,
  } = event
  const newStream = new Stream.Readable()
  const req = Object.assign(newStream, http.IncomingMessage.prototype)
  req.url = path
  req.originalUrl = req.url
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
        .end(statuses_1.default.message[data] || String(data));
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

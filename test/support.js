import jsdomlib from 'jsdom'
import Promise from 'bluebird'
import { spawn } from 'child_process'

export function exec (command, args, options) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, options)
    child.on('exit', code => resolve(code))
    child.on('error', error => reject(error))
    child.stdout.on('data', data => { console.log(data.toString()) })
    child.stderr.on('data', data => { console.error(data.toString()) })
  })
}

export function jsdom (html) {
  const env = Promise.promisify(jsdomlib.env)
  return env(html)
}

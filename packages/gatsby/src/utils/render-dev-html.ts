import sysPath from "path"
import JestWorker from "jest-worker"

const startWorker = (): any =>
  new JestWorker(sysPath.join(__dirname, `./render-dev-html-child.js`), {
    exposedMethods: [`renderHTML`],
    numWorkers: 1,
    enableWorkerThreads: true,
  })

let worker = startWorker()

export const restartWorker = (): void => {
  const oldWorker = worker
  const newWorker = startWorker()
  worker = newWorker
  oldWorker.end()
}

export const renderDevHTML = ({
  path,
  htmlComponentRendererPath,
  directory,
}): Promise<string> =>
  new Promise(async (resolve, reject) => {
    try {
      const response = await worker.renderHTML({
        path,
        htmlComponentRendererPath,
        directory,
      })
      resolve(response)
    } catch (error) {
      reject(error)
    }
  })

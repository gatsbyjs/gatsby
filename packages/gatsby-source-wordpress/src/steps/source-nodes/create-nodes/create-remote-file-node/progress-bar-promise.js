let resolveFileDownloaderProgressBarPromise

export const allowFileDownloaderProgressBarToClear = () => {
  resolveFileDownloaderProgressBarPromise()
}

export const remoteFileDownloaderBarPromise = new Promise(resolve => {
  resolveFileDownloaderProgressBarPromise = resolve
})

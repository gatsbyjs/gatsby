class GatsbyPuppeteer {
  constructor({ page, origin }) {
    this.page = page
    this.origin = origin
  }

  path() {
    return this.page.url().replace(this.origin, ``)
  }

  async goto(path) {
    return await this.page.goto(this.origin + path)
  }

  async navigate(path) {
    return await this.page.evaluate(path => window.___navigate(path), path)
  }

  async initAPIHandler() {
    await this.page.evaluate(() => {
      if (
        typeof window.___apiHandler === `function` &&
        typeof window.___waitForAPI === `function`
      ) {
        return
      }

      let resolve = null
      let awaitingAPI = null

      window.___apiHandler = api => {
        if (!awaitingAPI) {
          // If we're not currently waiting for anything,
          // mark the API as pre-resolved.
          window.___resolvedAPIs.push(api)
        } else if (api === awaitingAPI) {
          // If we've been waiting for something, now it's time to resolve it.
          awaitingAPI = null
          window.___resolvedAPIs = []
          resolve()
        }
      }

      window.___waitForAPI = api => {
        const promise = new Promise(r => {
          resolve = r
        })
        awaitingAPI = api

        if (window.___resolvedAPIs && window.___resolvedAPIs.includes(api)) {
          // If the API has been marked as pre-resolved,
          // resolve immediately and reset the variables.
          awaitingAPI = null
          window.___resolvedAPIs = []
          resolve()
        }
        return promise
      }
    })
  }

  async waitForAPI(api) {
    await this.initAPIHandler()
    return await this.page.evaluate(api => window.___waitForAPI(api), api)
  }

  async get(selector) {
    return await this.page.$(`[data-testid="${selector}"]`)
  }

  async click(selector) {
    return await (await this.get(selector)).click()
  }

  async prop(selector, property) {
    return await this.page.evaluate(
      (element, property) => element[property],
      await this.get(selector),
      property
    )
  }

  async text(selector) {
    return await this.prop(selector, `textContent`)
  }

  async html(selector) {
    return await this.prop(selector, `innerHTML`)
  }

  async changeFocus() {
    await this.page.evaluate(() => document.querySelector(`a`).focus())
  }

  async getFocusedID() {
    return await this.page.evaluate(() => document.activeElement.id)
  }
}

module.exports = GatsbyPuppeteer

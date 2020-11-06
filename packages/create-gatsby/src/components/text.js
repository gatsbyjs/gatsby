import { Input } from "enquirer"

export class MyInput extends Input {
  constructor(options = {}) {
    super(options)
    this.value = options.initial || 0
    this.cursorHide()
  }
  async render() {
    const size = this.state.size

    const prefix = await this.prefix()
    const separator = await this.separator()
    const message = await this.message()

    let prompt = [prefix, message, separator].filter(Boolean).join(` `)
    this.state.prompt = prompt

    const header = await this.header()
    let output = await this.format()
    const help = (await this.error()) || (await this.hint())
    const footer = await this.footer()

    if (help && !output.includes(help)) output += ` ` + help
    prompt += ` !!! ` + output

    this.clear(size)
    this.write([header, prompt, footer].filter(Boolean).join(`\n`))
    this.restore()
  }
}
